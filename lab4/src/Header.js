import React from 'react';

import { 
    Text,
    IconButton,
    Icon,
    HStack,
} from 'native-base'

import { MaterialIcons } from '@expo/vector-icons';


class Header extends React.Component {
    render() {
        return (
            <HStack px="1" py="3" justifyContent='space-between' alignItems='center'>
                <HStack space="4" alignItems='center'>
                    <Text style={{ fontWeight: 'bold', height: 50, lineHeight: 50, fontSize: 30 }}>OurStory</Text>
                </HStack>
                <HStack space="2">
                    <IconButton onPress={this.props.uploadPost} icon={<Icon as={<MaterialIcons name='photo-camera' />} color='black' size='md' />} />
                </HStack>
            </HStack>
        )
    }
}
export default Header
