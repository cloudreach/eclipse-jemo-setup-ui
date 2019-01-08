<template>

    <v-container grid-list-md class="ma-5">
        <div v-if="!permissions_validated && !permission_errors">
            <h3>Please wait while Jemo validates the user permissions.</h3>
            <v-progress-linear :indeterminate="true"></v-progress-linear>
        </div>

        <v-list v-if="permission_errors">
            <h3>The {{csp.name}} user does not have the following required permissions:</h3>

            <v-list-tile v-for="error in permission_errors" :key="error">
                <v-list-tile-content>
                    <v-list-tile-title v-text="error"></v-list-tile-title>
                </v-list-tile-content>
            </v-list-tile>
        </v-list>

        <template v-if="permissions_validated">
            <h3>Setup Completed</h3>
            Great job! The user has all the needed permissions.
            <br/>
            You can close this page as the setup is complete.
        </template>
    </v-container>
</template>

<script>
    export default {
        data() {
            return {
                csp: this.$route.params.csp,
                permission_errors: null,
                permissions_validated: false,
                valid: true
            }
        },
        mounted() {
            this.$http.get('http://localhost:8081/x2manager/setup/permissions/' + this.csp.name)
                .then(response => {
                    console.log(response);
                    this.permissions_validated = true;
                    this.$router.push({name: 'jemo-params', params: {csp: this.csp}})
                }, response => {
                    console.log(response);
                    this.permission_errors = response.data;
                });
        },
        methods: {}
    }
</script>
