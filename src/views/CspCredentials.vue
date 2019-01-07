<template>

    <v-container grid-list-md>
        <v-layout row wrap>

            <v-card flat class="text-xs-center ma-3">
                <v-card-title primary-title>
                    <div>
                        <h3 class="headline mb-0">
                            {{csp.name + (existingUser ? ' existing user credentials' : ' admin user credentials')}}
                        </h3>
                    </div>
                </v-card-title>

                <v-card-text>
                    <v-form ref="form" class="mx-4" v-model="valid">
                        <v-text-field v-for="credential in csp.requiredCredentials" :key="credential"
                                      v-model="credentials[credential]"
                                      :label="credential"
                                      required>
                        </v-text-field>
                    </v-form>
                    <!--<v-alert :value="credential_errors"-->
                    <!--color="error"-->
                    <!--icon="warning"-->
                    <!--outline>-->
                    <!--<span>Authentication failed</span>. {{credential_errors}}-->
                    <!--</v-alert>-->
                </v-card-text>
                <v-card-actions>
                    <v-btn class="mx-4" @click="validateCredentials">
                        Submit
                    </v-btn>
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
                existingUser: this.$route.params.existingUser,
                credentials: {},
                credential_errors: null,
                valid: true
            }
        },
        methods: {
            validateCredentials: function () {
                const formData = {
                    csp: this.csp.name,
                    credentials: this.credentials
                };
                console.log(formData);
                this.$http.post('http://localhost:8081/x2manager/setup/credentials', formData)
                    .then(response => {
                        console.log(response);
                        this.credential_errors = null;
                        if (this.existingUser) {
                            this.$router.push({name: 'csp-perm', params: {csp: this.csp}})
                        } else {
                            this.$router.push({name: 'user-create', params: {csp: this.csp, credentials: this.credentials}})
                        }
                    }, response => {
                        console.log(response);
                        alert(response.data);
                        this.credential_errors = response.data;
                    });
            }
        }
    }
</script>
