import localRegionData from 'china-division/dist/pca-code.json';
import { getAddressRegionApiUrl, getAddressRegionProvider, getAmapWebKey } from '../config/env';
import type { AddressRegionNode } from '../mock/address';
import { MOCK_ADDRESS_REGIONS } from '../mock/address';

export type AddressProvider = 'local' | 'backend' | 'amap' | 'auto' | 'mock';

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

interface ChinaDivisionRegion {
  code: string;
  name: string;
  children?: ChinaDivisionRegion[];
}

const AMAP_DISTRICT_API = 'https://restapi.amap.com/v3/config/district';
const DIRECT_REGION_CITY_NAME = '市辖区';

let localRegionTreeCache: AddressRegionNode[] | null = null;

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

function isDirectRegionCity(name: string) {
  return name === DIRECT_REGION_CITY_NAME || name === '县';
}

function mapLocalDistrict(node: ChinaDivisionRegion, parentCode: string): AddressRegionNode {
  return {
    code: node.code,
    name: node.name,
    level: 'district',
    parentCode,
  };
}

function mapLocalCity(node: ChinaDivisionRegion, parentCode: string): AddressRegionNode {
  return {
    code: node.code,
    name: node.name,
    level: 'city',
    parentCode,
    children: node.children?.map((item) => mapLocalDistrict(item, node.code)) ?? [
      {
        code: node.code,
        name: node.name,
        level: 'district',
        parentCode: node.code,
      },
    ],
  };
}

function mapLocalProvince(node: ChinaDivisionRegion): AddressRegionNode {
  const children = node.children ?? [];
  const directDistrictGroups = children.filter((item) => isDirectRegionCity(item.name));
  const cityChildren = directDistrictGroups.length > 0
    ? [
      {
        code: node.code,
        name: node.name,
        level: 'city' as const,
        parentCode: node.code,
        children: directDistrictGroups.flatMap((group) => (
          group.children?.map((item) => mapLocalDistrict(item, node.code)) ?? []
        )),
      },
    ]
    : children.map((item) => mapLocalCity(item, node.code));

  return {
    code: node.code,
    name: node.name,
    level: 'province',
    children: cityChildren.length > 0 ? cityChildren : [
      {
        code: node.code,
        name: node.name,
        level: 'city',
        parentCode: node.code,
        children: [
          {
            code: node.code,
            name: node.name,
            level: 'district',
            parentCode: node.code,
          },
        ],
      },
    ],
  };
}

function getLocalRegionTree(): AddressRegionNode[] {
  if (!localRegionTreeCache) {
    localRegionTreeCache = (localRegionData as ChinaDivisionRegion[]).map(mapLocalProvince);
  }
  return localRegionTreeCache;
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

function isRegionNodeArray(value: unknown): value is AddressRegionNode[] {
  return Array.isArray(value)
    && value.every((item) => (
      item
      && typeof item === 'object'
      && typeof (item as AddressRegionNode).code === 'string'
      && typeof (item as AddressRegionNode).name === 'string'
      && typeof (item as AddressRegionNode).level === 'string'
    ));
}

async function fetchBackendRegionTree(): Promise<AddressRegionNode[]> {
  const response = await fetch(getAddressRegionApiUrl());
  if (!response.ok) {
    throw new Error(`Region API request failed: ${response.status}`);
  }

  const payload = await response.json() as unknown;
  const data = payload && typeof payload === 'object' && 'data' in payload
    ? (payload as { data?: unknown }).data
    : payload;

  if (!isRegionNodeArray(data)) {
    throw new Error('Invalid backend region tree response');
  }

  return data;
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
    const provider = getAddressRegionProvider();
    if (provider === 'backend' || provider === 'amap' || provider === 'auto' || provider === 'mock') {
      return provider;
    }
    return 'local';
  },

  async getRegionTree(): Promise<AddressRegionNode[]> {
    const provider = this.getProvider();

    if (provider === 'mock') {
      return MOCK_ADDRESS_REGIONS;
    }

    if (provider === 'local') {
      return getLocalRegionTree();
    }

    if (provider === 'backend') {
      try {
        return await fetchBackendRegionTree();
      } catch {
        return getLocalRegionTree();
      }
    }

    if (provider === 'amap') {
      const key = getAmapWebKey();
      if (!key) return getLocalRegionTree();
      try {
        return await fetchAmapRegionTree(key);
      } catch {
        return getLocalRegionTree();
      }
    }

    try {
      return await fetchBackendRegionTree();
    } catch {
      const key = getAmapWebKey();
      if (key) {
        try {
          return await fetchAmapRegionTree(key);
        } catch {
          return getLocalRegionTree();
        }
      }
      return getLocalRegionTree();
    }
  },

  getFallbackRegionTree(): AddressRegionNode[] {
    return getLocalRegionTree();
  },
};
