<template>

    <v-container grid-list-md class="ma-5">
        <div v-if="!userCreated && !error">
            <h3>Please wait while Jemo creates the user.</h3>
            <v-progress-linear :indeterminate="true"></v-progress-linear>
        </div>

        <div v-if="error">
            <h3>User creation failed. The following error occurred:</h3>
            {{error}}
        </div>

        <div v-if="userCreated">
            <h3>Setup Completed</h3>
            Great job! The user 'jemo-user' is created and has all the needed permissions.
            <br/>

            <div>
                <pre>{{ terraformResult | pretty }}</pre>
            </div>

            You can close this page as the setup is completed.
        </div>

    </v-container>
</template>

<script>
    export default {
        data() {
            return {
                csp: this.$route.params.csp,
                credentials: this.$route.params.credentials,
                userCreated: false,
                error: null,
                terraformResult: null
            }
        },
        mounted() {
            const formData = {
                csp: this.csp.name,
                credentials: this.credentials
            };
            this.$http.post('http://localhost:8081/x2manager/setup/createuser', formData)
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
            pretty: function(value) {
                return JSON.stringify(value, null, 2);
            }
        }
    }
</script>
