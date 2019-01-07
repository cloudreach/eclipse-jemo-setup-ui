<template>
    <div class="home">
        <v-container grid-list-md>
            <v-layout row wrap>
                <v-flex xs12 sm6 md4 lg3 v-for="supportedCSP in supportedCSPs" :key="supportedCSP.name">
                    <v-card flat class="text-xs-center ma-3">
                        <v-card-title primary-title>
                            <div>
                                <h3 class="headline mb-0">{{supportedCSP.name}}</h3>
                                <a v-if="supportedCSP.url" :href="supportedCSP.url" target="_blank">{{supportedCSP.description}}</a>
                                <template v-else>{{supportedCSP.description}}</template>

                            </div>
                        </v-card-title>

                        <v-card-actions>
                            <!--<v-btn flat color="orange">Select</v-btn>-->
                            <v-btn flat color="orange" :to="{name: 'csp', params: {csp: supportedCSP}}">
                                <v-icon left>cloud</v-icon>
                                <span>Select</span>
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-flex>
            </v-layout>
        </v-container>

    </div>
</template>

<script>

    export default {
        data() {
            return {
                supportedCSPs: []
            };
        },
        mounted() {
            this.$http.get('http://localhost:8081/x2manager/setup/init')
                .then(response => {
                    console.log(response);
                    this.supportedCSPs = response.data
                }, response => {
                    console.log(response);
                });
        }
    }
</script>
