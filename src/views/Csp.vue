<template>

    <v-container grid-list-md>
        <v-layout row wrap>

            <v-card flat class="text-xs-center ma-3">
                <v-card-title primary-title>
                    <div>
                        <h3 class="headline mb-0">Use an existing {{csp.name}} user</h3>
                    </div>
                </v-card-title>

                <v-card-text>
                    Select this option if you want to start Jemo with an existing user.
                    Jemo will ask you for the user's credentials and will check if the user
                    has the required permissions. Jemo will list the missing permissions and it
                    is your responsibility to add these permissions and retry to validate them.
                </v-card-text>
                <v-card-actions>
                    <v-btn class="mx-2" :to="{name: 'csp-cred', params: {csp: csp, existingUser: true}}">
                        I have a user
                    </v-btn>
                </v-card-actions>
            </v-card>

            <v-card flat class="text-xs-center ma-3">
                <v-card-title primary-title>
                    <div>
                        <h3 class="headline mb-0">Eclipse Jemo user setup</h3>
                    </div>
                </v-card-title>

                <v-card-text>
                    Select this option if you want Jemo to generate a new user with the required permissions.
                    Credentials for a user with Admin permissions are required, as these are needed to create the new
                    user.
                    Internally, Jemo generates a <a href="https://www.terraform.io/" target="_blank">Terraform</a> form
                    with the all the needed configuration
                    (e.g. user/role/group/policy creation) and runs terraform.
                </v-card-text>
                <v-card-actions>
                    <v-btn class="mx-2" :to="{name: 'csp-cred', params: {csp: csp, existingUser: false}}">
                        Jemo User Setup
                    </v-btn>
                </v-card-actions>
            </v-card>

            <v-card flat class="text-xs-center ma-3">
                <v-card-title primary-title>
                    <div>
                        <h3 class="headline mb-0">Download the Terraform form</h3>
                    </div>
                </v-card-title>

                <v-card-text>
                    Similar to the previous option, except that the <a href="https://www.terraform.io/" target="_blank">Terraform</a>
                    form is not run by Jemo.
                    Instead, you download the form with the all the needed configuration and it is your responsibility
                    to run the terraform command. This option requires no credentials. The downloaded form includes
                    placeholders
                    for the credentials. You need to replace them with valid values, before you run the terraform
                    command.
                </v-card-text>
                <v-card-actions>
                    <v-btn class="mx-2" href="/x2manager/setup/terraform/jemo-template.tf" download>
                        Download Terraform Template
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
            }
        },
        watch: {
            '$route.params.csp' (to) {
                if (to) {
                    this.csp = to;
                }
            }
        }
    }
</script>
