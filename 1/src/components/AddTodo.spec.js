import {mount} from '@vue/test-utils'
import AddMission from './AddMission.vue'

describe('AddMission', () => {
    test('is a Vue instance', () => {
        const wrapper = mount(AddMission)
        expect(wrapper.isVueInstance()).toBeTruthy()
    })
})