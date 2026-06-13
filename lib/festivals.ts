import { Solar } from 'lunar-javascript';

// 公历固定节日（月-日）
const SOLAR_FESTIVALS: Record<string, string> = {
  '1-1': '元旦', '2-14': '情人节', '3-8': '妇女节', '3-12': '植树节',
  '4-1': '愚人节', '5-1': '劳动节', '5-4': '青年节', '6-1': '儿童节',
  '7-1': '建党节', '8-1': '建军节', '9-10': '教师节', '10-1': '国庆节',
  '12-24': '平安夜', '12-25': '圣诞节',
  '2-2': '世界湿地日', '3-21': '世界睡眠日', '4-23': '世界读书日',
  '8-8': '国际猫咪日', '10-4': '世界动物日', '11-11': '光棍节',
};

export type TodayInfo = {
  festival: string | null;   // 节日
  solarTerm: string | null;  // 节气
  lunarFestival: string | null; // 农历节日
  lunarDate: string;         // 农历日期文字
};

export function getTodayInfo(date = new Date()): TodayInfo {
  const solar = Solar.fromDate(date);
  const lunar = solar.getLunar();

  const m = solar.getMonth();
  const d = solar.getDay();
  const festival = SOLAR_FESTIVALS[`${m}-${d}`] || null;

  // 节气（今天是否是某个节气）
  const jieqi = lunar.getJieQi();
  const solarTerm = jieqi || null;

  // 农历节日
  const lunarFestivals = lunar.getFestivals();
  const lunarFestival = lunarFestivals.length > 0 ? lunarFestivals[0] : null;

  const lunarDate = `${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;

  return { festival, solarTerm, lunarFestival, lunarDate };
}
