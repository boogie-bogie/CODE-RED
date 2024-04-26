# 개발 환경 빌드 단계
FROM node:20.11.0-alpine AS development

WORKDIR /usr/src/app

# package.json 복사
COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.json tsconfig.json
COPY nest-cli.json nest-cli.json

# 의존성
RUN npm ci

# Nest.js 애플리케이션 빌드
COPY . .

RUN npm run build

# 프로덕션 환경 빌드 단계
FROM node:20.11.0-alpine as production

# NODE_ENV 설정
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

# package.json 복사
COPY package.json ./
COPY package-lock.json ./

# 프로덕션 의존성 설치
RUN npm install --only=production

# 개발 환경에서 빌드한 Nest.js 애플리케이션 복사
COPY --from=development /usr/src/app/dist ./dist
COPY --from=development /usr/src/app/node_modules ./node_modules

# 애플리케이션 실행 명령
CMD ["node", "dist/main"]

# Health Check 추가
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
CMD curl -f http://localhost:3000/health || exit 1