<template>

    <v-container grid-list-md>
        <v-layout row wrap>

            <v-card flat class="text-xs-center ma-3">
                <v-card-title primary-title>
                    <div>
                        <h3 class="headline mb-0">Use an existing {{csp.name}} jemo user</h3>
                    </div>
                </v-card-title>

                <v-card-text>
                    Select this option if you want to start Jemo with an existing user.
                    Jemo will ask you for the user's credentials and will check if the user
                    has the required permissions. Jemo will list the missing permissions and it
                    is your responsibility to add these permissions and retry to validate them.
                </v-card-text>
                <v-card-actions>
                    <v-btn class="mx-2" :to="{name: 'csp-cred', params: {csp: csp, isJemoUser: true}}" color="primary">
                        I have a user
                    </v-btn>
                </v-card-actions>
            </v-card>

            <v-card flat class="text-xs-center ma-3">
                <v-card-title primary-title>
                    <div>
                        <h3 class="headline mb-0">Jemo user setup</h3>
                    </div>
                </v-card-title>

                <v-card-text>
                    Select this option if you want Jemo to generate a new user with the required permissions.
                    Credentials for a terraform user with Admin permissions are required, as these are needed to create the jemo
                    user.
                    Internally, Jemo generates a <a href="https://www.terraform.io/" target="_blank">Terraform</a> form
                    with the all the needed configuration
                    (e.g. user/role/group/policy creation) and runs terraform.
                </v-card-text>
                <v-card-actions>
                    <v-btn class="mx-2" :to="{name: 'csp-cred', params: {csp: csp, isJemoUser: false}}" color="secondary">
                        Jemo User Setup
                    </v-btn>
                </v-card-actions>
            </v-card>

            <v-card flat class="text-xs-center ma-3">
                <v-card-title primary-title>
                    <div>
                        <h3 class="headline mb-0">Download the Terraform templates</h3>
                    </div>
                </v-card-title>

                <v-card-text>
                    Similar to the previous option, except that the <a href="https://www.terraform.io/" target="_blank">Terraform</a>
                    templates is not run by Jemo.
                    Instead, you download the form with the all the needed configuration and it is your responsibility
                    to run the terraform command. This option requires no credentials.
                </v-card-text>
                <v-card-actions>
                    <v-btn class="mx-2" @click="downloadTemplates()" color="error">
                        Download Terraform Templates
                    </v-btn>
                </v-card-actions>
            </v-card>

            <v-card flat class="text-xs-center ma-3">
                <v-card-title primary-title>
                    <div>
                        <h3 class="headline mb-0">Delete Existing Resources</h3>
                    </div>
                </v-card-title>

                <v-card-text>
                    Delete resources created by Jemo, if you don't need them any longer.
                    You can select to delete the cluster, but keep the installation resources, or delete them all.
                </v-card-text>
                <v-card-actions>
                    <v-btn class="mx-2" :to="{name: 'delete', params: {csp: this.csp, mode: 'INSTALL'}}">Delete Installation Resources</v-btn>
                    <v-btn class="mx-2" :to="{name: 'delete', params: {csp: this.csp, mode: 'CLUSTER'}}">Delete Cluster Resources</v-btn>
                </v-card-actions>
            </v-card>

        </v-layout>
    </v-container>
</template>

<script>
    export default {
        data() {
            return {
                csp: this.$route.params.csp,
            }
        },
        watch: {
            '$route.params.csp' (to) {
                if (to) {
                    this.csp = to;
                }
            }
        },
        methods: {
            downloadTemplates() {
                const payload = {
                    csp: this.csp.name,
                };
                this.$http.post('install/download', payload, {responseType: 'blob'})
                    .then(response => {
                        return response.blob();
                    }).then(blob => {
                    const a = document.createElement("a");
                    document.body.appendChild(a);
                    const url = window.URL.createObjectURL(blob);
                    a.href = url;
                    a.download = 'install.zip';
                    a.click();
                    window.URL.revokeObjectURL(url);
                    a.remove();
                });

                if (this.csp.installProperties) {
                    this.$router.push({name: 'install-props', params: {csp: this.csp}})
                }
            },
            deleteCluster() {
                this.$router.push({name: 'delete', params: {csp: this.csp, mode: 'CLUSTER'}})
            },
            deleteAll() {
                this.$router.push({name: 'delete', params: {csp: this.csp, mode: 'ALL'}})
            }
        }
    }
</script>
