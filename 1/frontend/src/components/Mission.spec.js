import {mount} from "@vue/test-utils"
import missions from '@/components/Missions.vue'

describe('MissionItem', () => {
    const wrapper = mount(missions);
    it('renders mission header', () =>{
        const wrapper=mount(missions)
        expect(wrapper.text()).toEqual('');
    })
})
