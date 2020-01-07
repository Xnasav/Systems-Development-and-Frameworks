import {mount, shallowMount} from '@vue/test-utils'
import missionitem from '@/components/MissionItem.vue'

describe('MissionItem', () => {

    it('renders props.msg when passed', () => {
        const mission = 'new mission'
        const wrapper = mount(missionitem, {
            propsData: { mission }
        })
        expect(wrapper.text()).toBe('Edit  X')
    })
})