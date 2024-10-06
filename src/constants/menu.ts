import AirTightIcon from '../assets/icons/component/AirTightIcon';
import HomeIcon from '../assets/icons/component/HomeIcon';
import LightingIcon from '../assets/icons/component/LightingIcon';
import TempIcon from '../assets/icons/component/TempIcon';

export const MENU = {
    home: {
        href: '',
        title: 'HOME',
        icon: HomeIcon,
    },
    temperature: {
        href: 'temperature',
        title: '실내 생활 온•습도',
        icon: TempIcon,
    },
    lighting: { href: 'lighting', title: '조명 밀도', icon: LightingIcon },
    airtight: { href: 'airtight', title: '기밀 성능', icon: AirTightIcon },
};
