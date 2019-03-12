<template>

    <v-container grid-list-md class="ma-5">
        <div v-if="loading && !installationComplete && !error">
            <h3>Please wait while Jemo creates the installation resources.</h3>
            <v-progress-linear :indeterminate="true"></v-progress-linear>
            <div v-if="terraformOutput">
                <pre>{{terraformOutput}}</pre>
                <div class="pa-3">
                    <v-progress-circular indeterminate :size="16"></v-progress-circular>
                </div>
            </div>
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
                <v-btn @click="install" color="primary" :loading="loading">Fixed</v-btn>
            </div>
            <div v-else>
                <h3>Terraform failed to create the installation resources. The following error occurred:</h3>
                <pre>{{error.message}}</pre>
                <br/>
                <v-btn :to="{name: 'delete', params: {csp: this.csp, mode: 'INSTALL'}}" color="primary">Revert</v-btn>
            </div>
        </div>

        <div v-if="installationComplete">
            <h3>Setup Completed</h3>
            Great job! The user 'jemo-user' is created and has all the needed permissions.
            <br/>

            <div>
                <pre>{{ terraformResult | pretty }}</pre>
            </div>

            Please, click the following button to input Jemo parameters<br/><br/>

            <v-btn @click="redirectToParamSet" color="primary">Next</v-btn>
        </div>

    </v-container>
</template>

<script>
    export default {
        data() {
            return {
                csp: this.$route.params.csp,
                parameters: this.$route.params.parameters,
                installationComplete: false,
                error: null,
                terraformResult: null,
                terraformOutput: null,
                loading: false,
                timer: null
            }
        },
        watch: {
            '$route'(to) {
                if (to.name === 'install') {
                    if (to.params.csp) {
                        this.csp = to.params.csp;
                        this.parameters = to.params.parameters ? to.params.parameters : this.parameters;
                        this.installationComplete = false;
                        this.loading = false;
                        this.error = null;
                        this.terraformResult = null;
                        this.terraformOutput = null;
                        this.install();
                    }
                }
            }
        },
        mounted() {
            this.install();
        },
        methods: {
            install() {
                this.loading = true;
                const payload = {
                    csp: this.csp.name,
                    parameters: this.parameters
                };
                this.$http.post('install', payload)
                    .then(response => {
                        console.log(response);
                        this.timer = setInterval(this.pollForDeletionResult, 10000);
                    }, response => {
                        console.log(response);
                        this.error = response.data;
                    });
            },
            pollForDeletionResult() {
                this.$http.get('install/result/' + this.csp.name + "/" + this.parameters.region)
                    .then(response => {
                        console.log(response);
                        this.terraformOutput = response.data.output;
                        if (response.data.status === 'FINISHED') {
                            clearInterval(this.timer);
                            if (response.data.error) {
                                this.error = response.data.error;
                            } else {
                                this.installationComplete = true;
                                this.error = null;
                                this.terraformResult = response.data.terraformResult;
                            }
                        }
                    }, response => {
                        clearInterval(this.timer);
                        console.log(response);
                        this.error = response.data;
                        alert(response.data);
                    });
            },
            redirectToParamSet() {
                this.$http.get('jemoparams/paramsets/' + this.csp.name)
                    .then(response => {
                        console.log(response);
                        this.$router.push({name: 'jemo-param-set', params: {csp: this.csp, paramSets: response.data}})
                    }, response => {
                        console.log(response);
                        alert(response.data);
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
