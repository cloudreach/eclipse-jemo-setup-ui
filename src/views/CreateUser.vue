<template>

    <v-container grid-list-md class="ma-5">
        <div v-if="!userCreated && !error">
            <h3>Please wait while Jemo creates the user.</h3>
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
                The server error was: <pre>{{error.message}}</pre>
            </div>
            <div v-else>
                <h3>Terraform failed to create the user. The following error occurred:</h3>
                <pre>{{error.message}}</pre>
            </div>
        </div>

        <div v-if="userCreated">
            <h3>Setup Completed</h3>
            Great job! The user 'jemo-user' is created and has all the needed permissions.
            <br/>

            <div>
                <pre>{{ terraformResult | pretty }}</pre>
            </div>

            Please, click the following button to input Jemo parameters<br/>

            <v-btn :to="{name: 'jemo-param-set', params: {csp: this.csp, isAdminUserLogged: true}}">Next</v-btn>
        </div>

    </v-container>
</template>

<script>
    export default {
        data() {
            return {
                csp: this.$route.params.csp,
                parameters: this.$route.params.parameters,
                userCreated: false,
                error: null,
                terraformResult: null
            }
        },
        mounted() {
            const payload = {
                csp: this.csp.name,
                parameters: this.parameters
            };
            this.$http.post('createuser', payload)
                .then(response => {
                    console.log(response);
                    this.userCreated = true;
                    this.error = null;
                    this.terraformResult = response.data;
                }, response => {
                    console.log(response);
                    this.error = response.data;
                });
        },
        filters: {
            pretty: function (value) {
                return JSON.stringify(value, null, 2);
            }
        }
    }
</script>
