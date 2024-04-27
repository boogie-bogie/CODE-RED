import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Shelters } from 'webapp/src/common/entities/shelters.entity';
import { Like, Repository } from 'typeorm';
import convert from 'xml-js'; // convert 메서드는 직접 import해서 억지로 끌어와야함

@Injectable()
export class SheltersService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(Shelters)
    private sheltersRepository: Repository<Shelters>,
  ) {}

  async getShelters() {
    const seoulShelter = await this.configService.get('SHELTER_API');
    const totalData = [];
    let response = await axios.get(
      `http://openapi.seoul.go.kr:8088/${seoulShelter}/xml/TbEqkShelter/1/1000/`, // 1/1000 , 1001/1552 등 데이터 숫자에 따라 변동 가능. 한번에 1000개까지만 가능.
    );

    // 공공데이터라 그런지 JSON이 아닌 XML 방식
    let xmlData = response.data;

    // 받아온 xml 방식의 데이터를 json으로 변환
    // compact : true는 압축된 json 형식이고, space는 json 출력시 들여쓰기 칸 수
    let xmlToJsonData = convert.xml2json(xmlData, {
      compact: true,
      spaces: 4,
    });

    // json 문자열을 자바스크립트 객체로 변환
    let shelterDataJsonVer = JSON.parse(xmlToJsonData);

    // 객체의 속성 안으로 접근 만약 shelterRows가 배열이 아니라면 배열로 만들어줌
    let shelterRows = shelterDataJsonVer['TbEqkShelter']['row'];
    if (!Array.isArray(shelterRows)) {
      shelterRows = [shelterRows];
    }
    totalData.push(...shelterRows);

    response = await axios.get(
      `http://openapi.seoul.go.kr:8088/${seoulShelter}/xml/TbEqkShelter/1001/1551/`, // 1/1000 , 1001/1551 등 데이터 숫자에 따라 변동 가능. 한번에 1000개까지만 가능.
    );
    xmlData = response.data;
    xmlToJsonData = convert.xml2json(xmlData, {
      compact: true,
      spaces: 4,
    });
    shelterDataJsonVer = JSON.parse(xmlToJsonData);
    shelterRows = shelterDataJsonVer['TbEqkShelter']['row'];
    if (!Array.isArray(shelterRows)) {
      shelterRows = [shelterRows];
    }
    totalData.push(...shelterRows);

    const shelterInfo = totalData.map((element) => {
      return {
        // ._text를 안 쓸 경우, shelterId : { _text:'1'} 이런식으로 표시됨
        id: parseInt(element.SHELTER_ID._text),
        shelter_id: parseInt(element.SHELTER_ID._text),
        address: element.DTL_ADRES._text,
        facility_name: element.VT_ACMDFCLTY_NM._text,
        facility_area: element.FCLTY_AR._text,
        longitude: parseFloat(element.LON._text),
        latitude: parseFloat(element.LAT._text),
        department_number: element.MNGPS_NM._text,
      };
    });
    const dbShelters = await this.sheltersRepository.find();
    // 현재 데이터베이스에 존재하는 모든 shelter_id를 가져옴. db속 대피소들을 모아서 그 안에 shelter_id만 추출한 후 객체 생성
    const existingShelterIds = new Set(
      dbShelters.map((shelter) => shelter.shelter_id),
    );

    // 배열을 풀어줌으로서 여러개의 객체들에 접근 가능하게 하기 위해 for문 사용
    // 대피소 정보 업데이트 또는 추가
    // .has : Set 객체 내에서 받은 인자값의 존재 여부를 판단해주는 메서드
    for (const shelter of shelterInfo) {
      if (existingShelterIds.has(shelter.shelter_id)) {
        await this.updateShelter(shelter.shelter_id, shelter);
      } else {
        await this.sheltersRepository.save(shelter);
      }
    }

    // 기존 데이터의 개수와 받아오는 데이터의 개수를 비교
    // 받아온 데이터 중 shelter_id만 뽑아서 Set 객체 형성 후 기존 데이터들과 비교
    // 받아온 데이터 안에 기존 데이터가 해당 안될 경우 그 데이터들은 삭제
    if (dbShelters.length > shelterInfo.length) {
      const apiShelterIds = new Set(
        shelterInfo.map((shelter) => shelter.shelter_id),
      );
      for (const dbShelter of dbShelters) {
        if (!apiShelterIds.has(dbShelter.shelter_id)) {
          await this.sheltersRepository.delete(dbShelter.shelter_id);
        }
      }
    }
  }

  async updateShelter(shelterId: number, shelterData: any) {
    const findShelterData = await this.sheltersRepository.findOne({
      where: {
        shelter_id: shelterId,
      },
    });
    if (!findShelterData) {
      throw new NotFoundException('Shelter not found');
    }
    // 업데이트가 필요한 부분을 모아놓
    const updatesNeeded = {};

    // 기존 데이터와 받아온 데이터의 키 값들 끼리 비교.. 해서 다르다면 그 값들만 updatesNeeded 배열에 할당
    Object.keys(shelterData).forEach((key) => {
      const apiValue = shelterData[key];
      const dbValue = findShelterData[key];

      // 위도 경도가 key값에 존재 하는지 확인. 그렇다면 비교한뒤 다르다면 받아온 값을 업데이트가 필요한 부분에 할당
      if (['longitude', 'latitude'].includes(key)) {
        if (parseFloat(apiValue) !== parseFloat(dbValue)) {
          updatesNeeded[key] = apiValue;
        }
      } else if (apiValue !== dbValue) {
        updatesNeeded[key] = apiValue;
      }
    });

    // 업데이트가 필요한 값들(updatesNeeded)이 있다면 그대로 업데이트 진행
    if (Object.keys(updatesNeeded).length > 0) {
      await this.sheltersRepository
        .createQueryBuilder()
        .update(Shelters)
        .set(updatesNeeded)
        .where('shelter_id = :shelter_id', { shelter_id: shelterId })
        .execute();
    }
    console.log(updatesNeeded);
  }

  async getSheltersMap(search: string) {
    const findShelterData = await this.sheltersRepository.find({
      where: [
        { address: Like(`%${search}%`) },
        { facility_name: Like(`%${search}%`) },
      ],
      select: {
        id: true,
        shelter_id: true,
        address: true,
        facility_name: true,
        facility_area: true,
        longitude: true,
        latitude: true,
        department_number: true,
      },
    });
    return findShelterData;
  }
}
