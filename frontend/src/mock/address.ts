export type AddressRegionLevel = 'province' | 'city' | 'district';

export interface AddressRegionNode {
  code: string;
  name: string;
  level: AddressRegionLevel;
  parentCode?: string;
  children?: AddressRegionNode[];
}

export const MOCK_ADDRESS_REGIONS: AddressRegionNode[] = [
  {
    code: '310000',
    name: '上海市',
    level: 'province',
    children: [
      {
        code: '310100',
        name: '上海市',
        level: 'city',
        parentCode: '310000',
        children: [
          { code: '310115', name: '浦东新区', level: 'district', parentCode: '310100' },
          { code: '310104', name: '徐汇区', level: 'district', parentCode: '310100' },
          { code: '310105', name: '长宁区', level: 'district', parentCode: '310100' },
          { code: '310106', name: '静安区', level: 'district', parentCode: '310100' },
          { code: '310112', name: '闵行区', level: 'district', parentCode: '310100' },
          { code: '310101', name: '黄浦区', level: 'district', parentCode: '310100' },
        ],
      },
    ],
  },
  {
    code: '110000',
    name: '北京市',
    level: 'province',
    children: [
      {
        code: '110100',
        name: '北京市',
        level: 'city',
        parentCode: '110000',
        children: [
          { code: '110105', name: '朝阳区', level: 'district', parentCode: '110100' },
          { code: '110108', name: '海淀区', level: 'district', parentCode: '110100' },
          { code: '110106', name: '丰台区', level: 'district', parentCode: '110100' },
          { code: '110101', name: '东城区', level: 'district', parentCode: '110100' },
          { code: '110102', name: '西城区', level: 'district', parentCode: '110100' },
          { code: '110112', name: '通州区', level: 'district', parentCode: '110100' },
        ],
      },
    ],
  },
  {
    code: '330000',
    name: '浙江省',
    level: 'province',
    children: [
      {
        code: '330100',
        name: '杭州市',
        level: 'city',
        parentCode: '330000',
        children: [
          { code: '330106', name: '西湖区', level: 'district', parentCode: '330100' },
          { code: '330105', name: '拱墅区', level: 'district', parentCode: '330100' },
          { code: '330108', name: '滨江区', level: 'district', parentCode: '330100' },
          { code: '330102', name: '上城区', level: 'district', parentCode: '330100' },
          { code: '330110', name: '余杭区', level: 'district', parentCode: '330100' },
        ],
      },
      {
        code: '330200',
        name: '宁波市',
        level: 'city',
        parentCode: '330000',
        children: [
          { code: '330212', name: '鄞州区', level: 'district', parentCode: '330200' },
          { code: '330203', name: '海曙区', level: 'district', parentCode: '330200' },
          { code: '330205', name: '江北区', level: 'district', parentCode: '330200' },
          { code: '330211', name: '镇海区', level: 'district', parentCode: '330200' },
        ],
      },
      {
        code: '330300',
        name: '温州市',
        level: 'city',
        parentCode: '330000',
        children: [
          { code: '330302', name: '鹿城区', level: 'district', parentCode: '330300' },
          { code: '330303', name: '龙湾区', level: 'district', parentCode: '330300' },
          { code: '330304', name: '瓯海区', level: 'district', parentCode: '330300' },
        ],
      },
    ],
  },
  {
    code: '440000',
    name: '广东省',
    level: 'province',
    children: [
      {
        code: '440300',
        name: '深圳市',
        level: 'city',
        parentCode: '440000',
        children: [
          { code: '440305', name: '南山区', level: 'district', parentCode: '440300' },
          { code: '440304', name: '福田区', level: 'district', parentCode: '440300' },
          { code: '440306', name: '宝安区', level: 'district', parentCode: '440300' },
          { code: '440307', name: '龙岗区', level: 'district', parentCode: '440300' },
          { code: '440303', name: '罗湖区', level: 'district', parentCode: '440300' },
        ],
      },
      {
        code: '440100',
        name: '广州市',
        level: 'city',
        parentCode: '440000',
        children: [
          { code: '440106', name: '天河区', level: 'district', parentCode: '440100' },
          { code: '440105', name: '海珠区', level: 'district', parentCode: '440100' },
          { code: '440104', name: '越秀区', level: 'district', parentCode: '440100' },
          { code: '440111', name: '白云区', level: 'district', parentCode: '440100' },
          { code: '440113', name: '番禺区', level: 'district', parentCode: '440100' },
        ],
      },
      {
        code: '441900',
        name: '东莞市',
        level: 'city',
        parentCode: '440000',
        children: [
          { code: '441900001', name: '南城街道', level: 'district', parentCode: '441900' },
          { code: '441900003', name: '东城街道', level: 'district', parentCode: '441900' },
          { code: '441900113', name: '长安镇', level: 'district', parentCode: '441900' },
        ],
      },
    ],
  },
  {
    code: '320000',
    name: '江苏省',
    level: 'province',
    children: [
      {
        code: '320500',
        name: '苏州市',
        level: 'city',
        parentCode: '320000',
        children: [
          { code: '320591', name: '工业园区', level: 'district', parentCode: '320500' },
          { code: '320505', name: '虎丘区', level: 'district', parentCode: '320500' },
          { code: '320506', name: '吴中区', level: 'district', parentCode: '320500' },
          { code: '320507', name: '相城区', level: 'district', parentCode: '320500' },
          { code: '320508', name: '姑苏区', level: 'district', parentCode: '320500' },
        ],
      },
      {
        code: '320100',
        name: '南京市',
        level: 'city',
        parentCode: '320000',
        children: [
          { code: '320106', name: '鼓楼区', level: 'district', parentCode: '320100' },
          { code: '320105', name: '建邺区', level: 'district', parentCode: '320100' },
          { code: '320102', name: '玄武区', level: 'district', parentCode: '320100' },
          { code: '320104', name: '秦淮区', level: 'district', parentCode: '320100' },
          { code: '320114', name: '雨花台区', level: 'district', parentCode: '320100' },
        ],
      },
      {
        code: '320200',
        name: '无锡市',
        level: 'city',
        parentCode: '320000',
        children: [
          { code: '320211', name: '滨湖区', level: 'district', parentCode: '320200' },
          { code: '320213', name: '梁溪区', level: 'district', parentCode: '320200' },
          { code: '320214', name: '新吴区', level: 'district', parentCode: '320200' },
        ],
      },
    ],
  },
  {
    code: '510000',
    name: '四川省',
    level: 'province',
    children: [
      {
        code: '510100',
        name: '成都市',
        level: 'city',
        parentCode: '510000',
        children: [
          { code: '510109', name: '高新区', level: 'district', parentCode: '510100' },
          { code: '510104', name: '锦江区', level: 'district', parentCode: '510100' },
          { code: '510107', name: '武侯区', level: 'district', parentCode: '510100' },
          { code: '510105', name: '青羊区', level: 'district', parentCode: '510100' },
          { code: '510108', name: '成华区', level: 'district', parentCode: '510100' },
        ],
      },
      {
        code: '510700',
        name: '绵阳市',
        level: 'city',
        parentCode: '510000',
        children: [
          { code: '510703', name: '涪城区', level: 'district', parentCode: '510700' },
          { code: '510704', name: '游仙区', level: 'district', parentCode: '510700' },
          { code: '510705', name: '安州区', level: 'district', parentCode: '510700' },
        ],
      },
    ],
  },
  {
    code: '420000',
    name: '湖北省',
    level: 'province',
    children: [
      {
        code: '420100',
        name: '武汉市',
        level: 'city',
        parentCode: '420000',
        children: [
          { code: '420111', name: '洪山区', level: 'district', parentCode: '420100' },
          { code: '420106', name: '武昌区', level: 'district', parentCode: '420100' },
          { code: '420103', name: '江汉区', level: 'district', parentCode: '420100' },
          { code: '420185', name: '东湖高新区', level: 'district', parentCode: '420100' },
        ],
      },
      {
        code: '420500',
        name: '宜昌市',
        level: 'city',
        parentCode: '420000',
        children: [
          { code: '420502', name: '西陵区', level: 'district', parentCode: '420500' },
          { code: '420503', name: '伍家岗区', level: 'district', parentCode: '420500' },
          { code: '420504', name: '点军区', level: 'district', parentCode: '420500' },
        ],
      },
    ],
  },
];
