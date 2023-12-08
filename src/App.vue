<template>
 <Home />


</template>
<script>
import Home from "./Home.vue";

export default {
    name:"app",
    components: {
        Home,
    },
    data() {
        return {
            message:'hello immoc.com'
        }
    }
}
</script>
<style scoped></style>