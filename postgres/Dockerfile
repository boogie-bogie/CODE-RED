# 기본 이미지
FROM postgis/postgis:latest

# 추가 확장 기능 설치 예시
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       postgresql-13-postgis-3-scripts

# 환경변수 설정
ENV POSTGRES_DB=postgres
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres

# 포트 설정
EXPOSE 5432