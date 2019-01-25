<template>

    <v-container grid-list-md class="ma-5">
        <div v-if="!downloadFormsOnly && !clusterCreated && !error">
            <h3>Please wait while Jemo creates the cluster. This can take up to 15 minutes.</h3>
            <v-progress-linear :indeterminate="true"></v-progress-linear>
        </div>

        <div v-if="error">
            <div v-if="error.code === 'TERRAFORM_NOT_INSTALLED'">
                <h3>The server can not find the terraform command.</h3>
                Either terraform is not installed (<a
                    href="https://learn.hashicorp.com/terraform/getting-started/install.html" target="_blank">Installation
                instructions</a>),
                or it is not in the path. (e.g. run: terraform -version).
                <br/>
                <br/>
                The server error was:
                <pre>{{error.message}}</pre>
            </div>
            <div v-else>
                <h3>Terraform failed to create the cluster. The following error occurred:</h3>
                <pre>{{error.message}}</pre>
            </div>
        </div>

        <div v-if="clusterCreated">
            <h3>Setup Completed</h3>
            Great job! The cluster is created. Terraform has created the following resources:
            <br/>

            <div>
                <pre>{{ clusterCreationResponse.terraformResult | pretty }}</pre>
            </div>
        </div>

        <div v-if="terraformFilesDownloaded">
            <h3>Please follow the instructions:</h3>
            <ul>
                <li>unzip cluster.zip</li>
                <li>cd cluster</li>
                <li>terraform init -var-file=cluster.tfvars</li>
                <li>terraform plan -var-file=cluster.tfvars</li>
                <li>terraform apply -var-file=cluster.tfvars</li>
            </ul>
            <br/>
            At this stage you should have the cluster up and running. Now you need to instantiate the kubernetes pods. Run:
            <ul>
                <li>aws eks update-kubeconfig --name jemo-cluster</li>
                <li>kubectl create -f kubernetes/jemo-statefulset.yaml</li>
                <li>kubectl create -f kubernetes/jemo-svc.yaml</li>
            </ul>

            <br/>
            Finally you need to allow worker nodes to join the cluster. Run:
            <ul>
                <li>terraform output config_map_aws_auth > config-map.yaml</li>
                <li>kubectl apply -f config-map.yaml</li>
            </ul>

            <br/>

            To delete everything, run:
            <ul>
                <li>kubectl delete -f kubernetes/jemo-statefulset.yaml</li>
                <li>kubectl delete svc jemo</li>
                <li>kubectl delete -n kube-system configmap aws-auth</li>
                <li>terraform destroy -var-file=cluster.tfvars</li>

            </ul>
        </div>

    </v-container>
</template>

<script>
    export default {
        data() {
            return {
                csp: this.$route.params.csp,
                parameters: this.$route.params.parameters,
                downloadFormsOnly: this.$route.params.downloadFormsOnly,
                clusterCreated: false,
                error: null,
                clusterCreationResponse: null,
                terraformFilesDownloaded: false,
                timer: null
            }
        },
        watch: {
            '$route'(to) {
                if (to.name === 'create-cluster') {
                    this.csp = to.params.csp ? to.params.csp : this.csp;
                    this.parameters = to.params.parameters ? to.params.parameters : this.parameters;
                    this.downloadFormsOnly = to.params.downloadFormsOnly ? to.params.downloadFormsOnly : this.downloadFormsOnly;
                    this.clusterCreated = false;
                    console.log('$route change in create-cluster');
                }
            }
        },
        mounted() {
            console.log('mounted');
            this.createCluster();
        },
        methods: {
            createCluster() {
                const payload = {
                    csp: this.csp.name,
                    parameters: this.parameters
                };

                if (this.downloadFormsOnly) {
                    this.$http.post('cluster/download', payload, {responseType: 'blob'})
                        .then(response => {
                            return response.blob();
                        }).then(blob => {
                        const a = document.createElement("a");
                        document.body.appendChild(a);
                        const url = window.URL.createObjectURL(blob);
                        a.href = url;
                        a.download = 'cluster.zip';
                        a.click();
                        window.URL.revokeObjectURL(url);
                        a.remove();
                        this.terraformFilesDownloaded = true;
                    });
                } else {
                    this.$http.post('cluster', payload)
                        .then(response => {
                            console.log(response);
                            this.timer = setInterval(this.pollForClusterCreationResult, 30000);
                        }, response => {
                            console.log(response);
                            this.error = response.data;
                        });
                }
            },
            pollForClusterCreationResult() {
                this.$http.get('cluster/result')
                    .then(response => {
                        console.log(response);
                        if (response.data.status === 'FINISHED') {
                            clearInterval(this.timer);
                            if (response.data.error) {
                                this.error = response.data.error;
                            } else {
                                this.clusterCreated = true;
                                this.error = null;
                                this.clusterCreationResponse = response.data;
                            }
                        }
                    }, response => {
                        console.log(response);
                        this.error = response.data.error;
                        alert(response.data.error);
                    });
            }
        },
        filters: {
            pretty: function (value) {
                return JSON.stringify(value, null, 2);
            }
        }
    }
</script>
