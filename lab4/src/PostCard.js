import React from 'react';

import { Dimensions } from 'react-native';

import {
    Text,
    VStack,
    HStack,
    Menu,
    Pressable,
	Icon,
} from 'native-base';

import { MaterialIcons } from '@expo/vector-icons';

import { S3Image } from 'aws-amplify-react-native';

const windowWidth = Dimensions.get('window').width;

class PostCard extends React.Component {

    getCurrentItem = () => this.props.post
  
    getUsername = () => this.getCurrentItem().username
    
    isOwnPost = () => {
      return this.props.userId == this.props.post.userId;
    }

    render () {
        return (
            <VStack>
                <HStack justifyContent='space-between' alignItems='center'>
                    <Text style={{ fontWeight: 'bold', height: 50, lineHeight: 50, marginLeft: 10 }}>
                        { this.getUsername() }
                    </Text>
                    { this.isOwnPost() && 
                        <Menu w="100"
                            trigger={(triggerProps) => {
                                return (
                                    <Pressable {...triggerProps}>
                                        <Icon as={<MaterialIcons name='more-horiz' />} color='black' size='md' />
                                    </Pressable>
                                )
                            }}>
                            <Menu.Item onPress={() => this.props.deletePost(this.props.post.file.key) }>Delete</Menu.Item>
                        </Menu>
                    }
                </HStack>
                <S3Image imgKey={this.getCurrentItem().file.key} style={{ height:windowWidth, width:windowWidth }} />
            </VStack>
        )
    }
}

export default PostCard
