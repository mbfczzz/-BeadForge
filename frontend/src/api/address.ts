import { getAmapWebKey } from '../config/env';
import type { AddressRegionNode } from '../mock/address';
import { MOCK_ADDRESS_REGIONS } from '../mock/address';

export type AddressProvider = 'mock' | 'amap';

export interface AddressRegionSelection {
  provinceCode: string;
  provinceName: string;
  cityCode: string;
  cityName: string;
  districtCode: string;
  districtName: string;
  text: string;
}

interface AmapDistrictItem {
  adcode: string;
  name: string;
  level: string;
  districts?: AmapDistrictItem[];
}

interface AmapDistrictResponse {
  status: string;
  info: string;
  infocode: string;
  districts?: AmapDistrictItem[];
}

const AMAP_DISTRICT_API = 'https://restapi.amap.com/v3/config/district';

function mapAmapLevel(level: string): AddressRegionNode['level'] {
  if (level === 'province') return 'province';
  if (level === 'city') return 'city';
  return 'district';
}

function mapAmapNode(node: AmapDistrictItem, parentCode?: string): AddressRegionNode {
  return {
    code: node.adcode,
    name: node.name,
    level: mapAmapLevel(node.level),
    parentCode,
    children: node.districts?.map((item) => mapAmapNode(item, node.adcode)),
  };
}

async function fetchAmapRegionTree(key: string): Promise<AddressRegionNode[]> {
  const params = new URLSearchParams({
    key,
    keywords: '中国',
    subdistrict: '3',
    extensions: 'base',
  });

  const response = await fetch(`${AMAP_DISTRICT_API}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`AMap request failed: ${response.status}`);
  }

  const result = (await response.json()) as AmapDistrictResponse;
  if (result.status !== '1' || !result.districts?.[0]?.districts) {
    throw new Error(result.info || 'AMap district query failed');
  }

  return result.districts[0].districts.map((item) => mapAmapNode(item));
}

export function buildRegionSelection(
  province: AddressRegionNode,
  city: AddressRegionNode,
  district: AddressRegionNode,
): AddressRegionSelection {
  return {
    provinceCode: province.code,
    provinceName: province.name,
    cityCode: city.code,
    cityName: city.name,
    districtCode: district.code,
    districtName: district.name,
    text: `${province.name} ${city.name} ${district.name}`,
  };
}

export const addressRegionApi = {
  getProvider(): AddressProvider {
    return getAmapWebKey() ? 'amap' : 'mock';
  },

  async getRegionTree(): Promise<AddressRegionNode[]> {
    const key = getAmapWebKey();
    if (!key) {
      return MOCK_ADDRESS_REGIONS;
    }

    try {
      return await fetchAmapRegionTree(key);
    } catch {
      return MOCK_ADDRESS_REGIONS;
    }
  },

  getFallbackRegionTree(): AddressRegionNode[] {
    return MOCK_ADDRESS_REGIONS;
  },
};
