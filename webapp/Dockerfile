# 개발 환경 빌드 단계
FROM node:18-alpine AS build

WORKDIR /usr/src/app

# package.json 복사
COPY package*.json ./
COPY tsconfig.json nest-cli.json ./

# 의존성
RUN npm ci

# Nest.js 애플리케이션 빌드
COPY . .

RUN npm run build

# 프로덕션 환경 빌드 단계
FROM node:18-alpine as production

# NODE_ENV 설정
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

# 개발 환경에서 빌드한 Nest.js 애플리케이션 복사
COPY --from=build /usr/src/app/dist ./dist

# package.json 복사
COPY package.json ./
COPY package-lock.json ./

# 프로덕션 의존성 설치
RUN npm install --only=production

# 애플리케이션 실행 명령
CMD ["node", "dist/main"]