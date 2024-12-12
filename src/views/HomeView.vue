<template>
  <div center h="90vh">
    <el-container>
      <el-header center>
        <h1 mb="10%">MY DARLING工具箱</h1>
      </el-header>
      <el-main>
        <nav center gap-6>
          <div class="item-card" v-for="item in clickItemList" :key="item.text"
            :style="{ backgroundColor: item.bgColor, '--hover-bg-color': item.hoverBgColor }"
            @click="routerTo(item.path)">
            <span>{{ item.text }}</span>
          </div>
        </nav>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()

interface IClickItem {
  text: string
  path: string
  bgColor?: string
  hoverBgColor?: string
}

const clickItemList: IClickItem[] = [
  {
    text: '统计ppt中的字数',
    path: '/count-ppt-word',
    bgColor: 'mediumturquoise',
    hoverBgColor: 'lightblue',
  },
  {
    text: '敬请期待',
    path: '',
    bgColor: 'rgb(176, 238, 246)',
    hoverBgColor: 'rgb(126, 138, 246)',
  },
]

function routerTo(path: string) {
  if (path === '') {
    ElMessageBox.alert('请老婆大人随时提需求!', '提示', {})
  }
  if (path) {
    router.push(path)
  }
}
</script>

<style scoped lang="scss">
.item-card {
  position: relative;
  width: 320px;
  height: 220px;
  background: mediumturquoise;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 25px;
  font-weight: bold;
  border-radius: 15px;
  cursor: pointer;

  &::before,
  &::after {
    position: absolute;
    content: "";
    width: 20%;
    height: 20%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 25px;
    font-weight: bold;
    background-color: var(--hover-bg-color); // 使用 CSS 自定义属性
    transition: all 0.5s;
  }

  &::before {
    top: 0;
    right: 0;
    border-radius: 0 15px 0 100%;
  }

  &::after {
    bottom: 0;
    left: 0;
    border-radius: 0 100% 0 15px;
  }

  &:hover::before,
  &:hover:after {
    width: 100%;
    height: 100%;
    border-radius: 15px;
    transition: all 0.5s;
  }

  &:hover:after {
    overflow: hidden;
    content: "点击进入";
  }
}
</style>
