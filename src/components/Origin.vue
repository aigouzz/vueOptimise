<script >
    import index from '../core/observer/index';
    export default{
        data() {
            return {
                title: 'vue解析'
            }
        },
    };
</script>
<template>
<div class="origin-wrap">
    <h2>{{title}}</h2>
    <div>show how to build a vue </div>
    <p>1.observe</p>
    <p>2.initState(data events methods watch)</p>
    <p>3.lifecycle</p>
    <p>4.VNode</p>
    <p>5.plugin</p>
    <p>6.directive</p>
</div>
</template>