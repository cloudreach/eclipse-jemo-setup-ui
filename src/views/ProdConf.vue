<template>

    <v-container grid-list-md>
        <v-layout row wrap>

            <v-card class="text-md-center ma-3">
                <v-card-title primary-title>
                    <div>
                        <h3 class="headline mb-0">
                            Please review cluster parameter values
                        </h3>
                    </div>
                </v-card-title>

                <v-card-text>

                    <div v-for="param in params" :key="param.name">

                        <div v-if="!param.isVpc">
                            <v-select v-if="param.items"
                                      v-model="param.value"
                                      :items="param.items"
                                      :label="createLabel(param)">
                            </v-select>

                            <v-text-field v-else
                                          v-model="param.value"
                                          :label="createLabel(param)"
                                          required>
                            </v-text-field>
                        </div>
                    </div>
                </v-card-text>

                <v-divider></v-divider>
                <v-subheader>Policy to attach to cluster and worker nodes</v-subheader>

                <v-card-text>
                    <v-select v-model="selectedPolicy"
                              :items="policies"
                              label="Existing Policies"
                              v-on:input="changeRoute()">
                    </v-select>
                </v-card-text>

                <v-divider></v-divider>
                <v-subheader>VPC parameters</v-subheader>

                <v-card-text v-if="!existingVpcNames">
                    <div v-for="param in params" :key="param.name">

                        <div v-if="param.isVpc">
                            <v-text-field
                                    v-model="param.value"
                                    :label="createLabel(param)"
                                    required>
                            </v-text-field>

                        </div>
                    </div>
                    <v-btn @click="getExistingVpcs" color="primary">Or Select existing vpc</v-btn>
                </v-card-text>
                <v-card-text v-else>
                    <v-select v-model="selectedVpcName"
                              :items="existingVpcNames"
                              label="Existing VPCs">
                    </v-select>
                </v-card-text>

                <v-divider></v-divider>
                <v-subheader>Map containers to parameter sets</v-subheader>

                <v-card-text>

                    <v-text-field v-for="(value, key) in instanceParamSets"
                                  v-model="instanceParamSets[key]"
                                  :label="createReplicasLabel(key)"
                                  :key="key"
                                  required>
                    </v-text-field>


                </v-card-text>
                <v-card-actions>
                    <v-layout row justify-center>
                        <v-btn v-if="isAdminUserLogged" @click="deployCluster(false)" color="primary">Create Cluster</v-btn>

                        <v-dialog v-else v-model="dialog" persistent max-width="600px" class="mx-1">
                            <v-btn slot="activator" color="primary" dark>Create Cluster</v-btn>
                            <v-card>
                                <v-card-title>
                                    <span class="headline">Admin credentials are needed to run Terraform</span>
                                </v-card-title>
                                <v-card-text>
                                    <v-container grid-list-md>
                                        <v-layout wrap>

                                            <v-flex xs12 v-for="credential in csp.requiredCredentials"
                                                    :key="credential">
                                                <v-text-field v-model="credentialParameters[credential]"
                                                              :label="credential"></v-text-field>
                                            </v-flex>
                                        </v-layout>
                                    </v-container>
                                </v-card-text>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn color="blue darken-1" flat @click="dialog = false">Cancel</v-btn>
                                    <v-btn color="blue darken-1" flat @click="validateCredentials">OK</v-btn>
                                </v-card-actions>

                            </v-card>
                        </v-dialog>
                        <v-btn @click="deployCluster(true)" color="secondary">Download Terraform Templates</v-btn>
                    </v-layout>
                </v-card-actions>
            </v-card>

            <div v-if="clusterCreated">
                <h3>Cluster created</h3>
                Great job! The cluster is created. Terraform has created the following resources:
                <br/>

                <div>
                    <pre>{{ terraformResult | pretty }}</pre>
                </div>
            </div>
        </v-layout>

        <v-dialog v-model="policyValidationErrorDialog" persistent max-width="600">
            <v-card>
                <v-card-title class="headline">Policy '{{selectedPolicy}}' does not have the required permissions
                </v-card-title>
                <v-card-text>Please select another policy or add to '{{selectedPolicy}}' the following permissions:
                </v-card-text>
                <v-list dense>
                    <v-list-tile
                            v-for="permission in policyValidationError"
                            :key="permission">

                        <v-list-tile-content>
                            <v-list-tile-title v-text="permission"></v-list-tile-title>
                        </v-list-tile-content>

                    </v-list-tile>
                </v-list>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="green darken-1" flat @click="policyValidationErrorDialog = false">Close</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

    </v-container>

</template>

<script>
    export default {
        data() {
            return {
                csp: this.$route.params.csp,
                paramSets: this.$route.params.paramSets,
                isAdminUserLogged: this.$route.params.isAdminUserLogged,
                valid: true,
                clusterCreated: false,
                terraformResult: null,
                dialog: false,
                existingVpcNames: null,
                selectedVpcName: null,
                policies: null,
                selectedPolicy: null,
                policyValidationErrorDialog: false,
                policyValidationError: [],
                credentialParameters: {},
                params: {
                    clusterName: {
                        name: 'cluster-name',
                        description: 'the cluster name',
                        value: 'jemo-cluster'
                    },
                    clusterRoleName: {
                        name: 'cluster-role-name',
                        description: 'the cluster role name',
                        value: 'jemo-cluster-role'
                    },
                    clusterSecurityGroupName: {
                        name: 'cluster-security-group-name',
                        description: 'the cluster security group name',
                        value: 'jemo-cluster-security-group'
                    },
                    clusterSecurityGroupNameTag: {
                        name: 'cluster-security-group-name-tag',
                        description: 'the cluster security group name tag',
                        value: 'jemo-cluster'
                    },
                    workstationExternalCidr: {
                        name: 'workstation-external-cidr',
                        description: 'comma separated list of local workstation IPs allowed to access the cluster',
                        value: ''
                    },
                    vpcNameTag: {
                        name: 'vpc-name-tag',
                        description: 'the cluster VPC name tag',
                        value: 'jemo-vpc',
                        isVpc: true
                    },
                    subnetNameTag: {
                        name: 'subnet-name-tag',
                        description: 'the subnet name tag',
                        value: 'jemo-subnet',
                        isVpc: true
                    },
                    internetGatewayNameTag: {
                        name: 'internet-gateway-name-tag',
                        description: 'the internet gateway name tag',
                        value: 'jemo-internet-gateway',
                        isVpc: true
                    },
                    workerNodeRoleName: {
                        name: 'worker-node-role-name',
                        description: 'the worker nodes role name',
                        value: 'jemo-node-role'
                    },
                    workerNodeInstanceProfileName: {
                        name: 'worker-node-instance-profile-name',
                        description: 'the worker nodes instance profile name',
                        value: 'jemo-node-instance-profile'
                    },
                    workerNodeSecurityGroupName: {
                        name: 'worker-node-security-group-name',
                        description: 'the worker nodes security group name',
                        value: 'jemo-node-security-group'
                    },
                    launchConfInstanceType: {
                        name: 'launch-conf-instance-type',
                        description: 'the AWS launch configuration instance type',
                        items: ['a1.medium', 'a1.large', 'a1.xlarge', 'a1.2xlarge', 'a1.4xlarge',
                            't3.nano', 't3.micro', 't3.small', 't3.medium', 't3.large', 't3.xlarge', 't3.2xlarge',
                            't2.nano', 't2.micro', 't2.small', 't2.medium', 't2.large', 't2.xlarge', 't2.2xlarge',
                            'm5.large', 'm5.xlarge', 'm5.2xlarge', 'm5.4xlarge', 'm5.12xlarge', 'm5.24xlarge', 'm5d.large', 'm5d.xlarge', 'm5d.2xlarge', 'm5d.4xlarge', 'm5d.12xlarge', 'm5d.24xlarge',
                            'm5a.large', 'm5a.xlarge', 'm5a.2xlarge', 'm5a.4xlarge', 'm5a.12xlarge', 'm5a.24xlarge',
                            'm4.large', 'm4.xlarge', 'm4.2xlarge', 'm4.4xlarge', 'm4.10xlarge', 'm4.16xlarge'],
                        value: 'm4.large'
                    },
                    launchConfNamePrefix: {
                        name: 'launch-conf-name-prefix',
                        description: 'the AWS launch configuration name prefix',
                        value: 'jemo'
                    },
                    autoscalingGroupName: {
                        name: 'autoscaling-group-name',
                        description: 'the AWS autoscaling group name',
                        value: 'jemo'
                    },
                    autoscalingGroupDesiredCapacity: {
                        name: 'autoscaling-group-desired-capacity',
                        description: 'the AWS autoscaling group capacity',
                        value: 2
                    },
                    autoscalingGroupMaxSize: {
                        name: 'autoscaling-group-max-size',
                        description: 'the AWS autoscaling group max size',
                        value: 2
                    },
                    autoscalingGroupMinSize: {
                        name: 'autoscaling-group-min-size',
                        description: 'the AWS autoscaling group min size',
                        value: 1
                    }
                },
                instanceParamSets: {}
            }
        },
        methods: {
            createLabel(param) {
                return param.name + ' (' + param.description + ')';
            },
            createReplicasLabel(paramSetName) {
                return 'Number of containers using ' + paramSetName;
            },
            getExistingVpcs() {
                this.$http.get('vpc/' + this.csp.name)
                    .then(response => {
                        console.log(response);
                        this.existingVpcNames = response.data;
                    }, response => {
                        console.log(response);
                        alert(response.data);
                    });
            },
            validateCredentials() {
                this.credentialParameters['region'] = this.csp.region;
                const payload = {
                    csp: this.csp.name,
                    parameters: this.credentialParameters
                };
                console.log(payload);
                this.$http.post('credentials', payload)
                    .then(response => {
                        console.log(response);
                        this.dialog = false;
                        this.deployCluster();
                    }, response => {
                        console.log(response);
                        alert(response.data);
                    });
            },
            changeRoute() {
                console.log(this.selectedPolicy);
                const payload = {
                    csp: this.csp.name,
                    parameters: {
                        policy: this.selectedPolicy
                    }
                };
                this.$http.post('policy/validate', payload)
                    .then(response => {
                        console.log(response.data);
                        if (response.data.notAllowedActions.length > 0) {
                            this.policyValidationErrorDialog = true;
                            this.policyValidationError = response.data.notAllowedActions;
                        }
                    }, response => {
                        alert(response.data);
                    });
            },
            deployCluster(downloadFormsOnly) {
                const parameters = {};
                for (let key in this.params) {
                    let param = this.params[key];
                    parameters[param.name] = param.value;
                }

                let containersPerParamSet = Object.keys(this.instanceParamSets)
                    .map(k => k + ':' + this.instanceParamSets[k])
                    .join(",");
                parameters['containersPerParamSet'] = containersPerParamSet;

                if (this.selectedVpcName) {
                    parameters['existing-vpc-name'] = this.selectedVpcName;
                }
                parameters['policy-id'] = this.selectedPolicy;

                this.$router.push({name: 'create-cluster', params: {csp: this.csp, parameters: parameters, downloadFormsOnly: downloadFormsOnly}})
            },
        },
        mounted() {
            this.paramSets.forEach(paramSet => this.instanceParamSets[paramSet.name] = 0)

            this.$http.get('http://ipv4.icanhazip.com')
                .then(response => {
                    console.log(response);
                    this.params.workstationExternalCidr.value = response.data.trim() + '/32';
                }, response => {
                    console.log("Can not find local ip");
                    console.log(response);
                });

            this.$http.get('policy/' + this.csp.name)
                .then(response => {
                    console.log(response);
                    this.policies = response.data;
                    if (this.policies.includes('jemo-policy')) {
                        this.selectedPolicy = 'jemo-policy';
                    }
                }, response => {
                    console.log(response);
                });
        }
    }
</script>
