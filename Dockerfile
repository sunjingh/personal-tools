# 使用官方 Node.js 镜像作为基础镜像
FROM node:23-alpine 

# 设置工作目录
WORKDIR /app

# 安装pnpm
RUN npm install -g pnpm --registry=https://registry.npmmirror.com

COPY front/package.json .
COPY front/pnpm-lock.yaml .

# 安装项目依赖
RUN pnpm install --registry=https://registry.npmmirror.com

# 复制项目文件到容器中
COPY . .

# 构建 Vue 项目
RUN npm run build

# 使用 nginx 提供服务
FROM nginx:1.26-alpine

# 复制 Nginx 配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 将 Vue 构建输出复制到 nginx 的默认静态文件目录
COPY --from=0 /app/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
