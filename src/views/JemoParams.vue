<template>

    <v-container grid-list-md>
        <v-layout row wrap>

            <v-card flat class="text-xs-center ma-3" v-if="!hasFinished">
                <v-card-title primary-title>
                    <div>
                        <h3 class="headline mb-0">
                            Please review default values for Jemo parameters
                        </h3>
                    </div>
                </v-card-title>

                <v-card-text>
                    <v-form ref="form" class="mx-4" v-model="valid">
                        <v-text-field v-for="(value, key) in parameters" :key="key"
                                      v-model="parameters[key]"
                                      :label="key"
                                      required>
                        </v-text-field>
                    </v-form>

                </v-card-text>
                <v-card-actions>
                    <v-btn @click="sendParameters">
                        Submit
                    </v-btn>
                </v-card-actions>
            </v-card>

            <v-card flat class="text-xs-center ma-3" v-else>
                <v-card-title primary-title>
                    <div>
                        <h3 class="headline mb-0">
                            Setup Complete
                        </h3>
                    </div>
                </v-card-title>
                <v-card-text>
                    Great job!
                    You can close this page as the setup is complete.
                </v-card-text>
            </v-card>

        </v-layout>
    </v-container>
    </template>

    <script>
        export default {
            data() {
                return {
                    csp: this.$route.params.csp,
                    parameters: {
                        'cloudreach.connect.location': 'AWS',
                        'cloudreach.connect.http.port': '8080',
                        'cloudreach.connect.http.mode': 'HTTP',
                        'cloudreach.connect.plugin.whitelist': '',
                        'cloudreach.connect.plugin.blacklist': '',
                        'cloudreach.connect.queue.polltime': '20000',
                        'cloudreach.connect.location.cloud': 'false',
                        'cloudreach.connect.logs': '',
                        'cloudreach.connect.output': '',
                        'cloudreach.connect.log.level': 'INFO'
                    },
                    hasFinished: false,
                    valid: true
                }
            },
            methods: {
                sendParameters: function () {
                    let payload = {
                        csp: this.csp.name,
                        parameters: this.parameters
                    }
                    this.$http.post('http://localhost:8081/x2manager/setup/jemoparams', payload)
                        .then(response => {
                            console.log(response);
                            this.hasFinished = true;
                        }, response => {
                            console.log(response);
                            alert(response.data);
                        });
                }
            }
        }
    </script>
