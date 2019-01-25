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
                                      v-model="parameters[credential]"
                                      :label="credential"
                                      required>
                        </v-text-field>

                        <v-container fluid>
                            <v-layout row wrap align-center>
                                <v-flex xs6>
                                    <v-subheader>Select Region</v-subheader>
                                </v-flex>

                                <v-flex xs6>
                                    <v-select
                                            v-model="region"
                                            :hint="region.description"
                                            :items="csp.regions"
                                            item-text="code"
                                            item-value="description"
                                            label="Region"
                                            persistent-hint
                                            return-object
                                            single-line>
                                    </v-select>
                                </v-flex>

                            </v-layout>
                            <v-layout row wrap align-center>
                                <v-flex xs6>
                                    <v-subheader>Or Add a new Region Code</v-subheader>
                                </v-flex>

                                <v-flex xs6>
                                    <v-form>
                                        <v-text-field
                                                v-model="regionCode"
                                                required>
                                        </v-text-field>
                                    </v-form>
                                </v-flex>

                            </v-layout>
                        </v-container>
                    </v-form>
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
                parameters: {},
                credential_errors: null,
                valid: true,
                region: this.$route.params.csp.regions[0],
                regionCode: null
            }
        },
        methods: {
            validateCredentials: function () {
                let regionCode = this.regionCode ? this.regionCode : this.region.code;
                this.parameters['region'] = regionCode;
                const payload = {
                    csp: this.csp.name,
                    parameters: this.parameters
                };
                console.log(payload);
                this.$http.post('credentials', payload)
                    .then(response => {
                        console.log(response);
                        this.credential_errors = null;
                        this.csp['region'] = regionCode;
                        if (this.existingUser) {
                            this.$router.push({name: 'csp-perm', params: {csp: this.csp}})
                        } else {
                            this.$router.push({
                                name: 'user-create',
                                params: {csp: this.csp, parameters: this.parameters, isAdminUserLogged: true}
                            })
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
