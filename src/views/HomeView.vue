<template>
  <el-container>
    <el-header center>
      <h1>工具箱</h1>
    </el-header>
    <el-main>
      <div center>
        <nav>
          <div border="1px solid #ccc" bg-blue center p-3 cursor-pointer class="card" v-for="item in clickItemList"
            :key="item.text" @click="routerTo(item.path)">
            <span>{{ item.text }}</span>
          </div>
        </nav>
      </div>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
const router = useRouter()

interface IClickItem {
  text: string
  path: string
}

const clickItemList: IClickItem[] = [
  {
    text: 'ppt字数统计',
    path: '/count-ppt-word',
  },
]

function routerTo(path: string) {
  router.push(path)
}
</script>

<style scoped lang="scss">
/* From Uiverse.io by eslam-hany */
.card {
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
}

.card::before,
.card::after {
  position: absolute;
  content: "";
  width: 20%;
  height: 20%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 25px;
  font-weight: bold;
  background-color: lightblue;
  transition: all 0.5s;
}

.card::before {
  top: 0;
  right: 0;
  border-radius: 0 15px 0 100%;
}

.card::after {
  bottom: 0;
  left: 0;
  border-radius: 0 100% 0 15px;
}

.card:hover::before,
.card:hover:after {
  width: 100%;
  height: 100%;
  border-radius: 15px;
  transition: all 0.5s;
}

.card:hover:after {
  overflow: hidden;
  content: "点击进入";
}
</style>
