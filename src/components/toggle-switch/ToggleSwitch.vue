<template>
  <div class="toggle-button-cover">
    <div id="button-3" class="button r">
      <input v-model="checked" class="checkbox" type="checkbox" @change="handleInputChange">
      <div class="knobs"></div>
      <div class="layer"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
const checked = defineModel<boolean>('modelValue', { default: false })

const emits = defineEmits<{
  change: [value: boolean]
}>()

function handleInputChange() {
  emits('change', checked.value)
}
</script>

<style scoped>
.toggle-button-cover {
  display: table-cell;
  position: relative;
  box-sizing: border-box;
}

.button-cover {
  height: 50px;
  margin: 10px;
  background-color: #fff;
  box-shadow: 0 10px 20px -8px #c5d6d6;
  border-radius: 4px;
}

.button-cover:before {
  counter-increment: button-counter;
  content: counter(button-counter);
  position: absolute;
  right: 0;
  bottom: 0;
  color: #d7e3e3;
  font-size: 12px;
  line-height: 1;
  padding: 5px;
}

.button-cover,
.knobs,
.layer {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.button {
  position: relative;
  top: 50%;
  width: 54px;
  height: 28px;
  margin: 0 auto 0 auto;
  overflow: hidden;
}

.checkbox {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  opacity: 0;
  cursor: pointer;
  z-index: 3;
}

.knobs {
  z-index: 2;
}

.layer {
  width: 100%;
  background-color: #fa9191;
  transition: 0.3s ease all;
  z-index: 1;
}

.button.r,
.button.r .layer {
  border-radius: 100px;
}

#button-3 .knobs:before {
  content: "NO";
  position: absolute;
  top: 4px;
  left: 4px;
  width: 20px;
  height: 20px;
  color: #fff;
  font-size: 9px;
  font-weight: bold;
  text-align: center;
  line-height: 1;
  padding: 5px 3px;
  background-color: #f44336;
  border-radius: 50%;
  transition: 0.3s ease all, left 0.3s cubic-bezier(0.18, 0.89, 0.35, 1.15);
}

#button-3 .checkbox:active+.knobs:before {
  width: 46px;
  border-radius: 100px;
}

#button-3 .checkbox:checked:active+.knobs:before {
  margin-left: -26px;
}

#button-3 .checkbox:checked+.knobs:before {
  content: "YES";
  left: 55%;
  background-color: #03a9f4;
}

#button-3 .checkbox:checked~.layer {
  background-color: #60c1eb;
}
</style>
