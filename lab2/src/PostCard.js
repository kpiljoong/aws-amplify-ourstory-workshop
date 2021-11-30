import React from 'react';

import { Dimensions } from 'react-native';

import {
    Text,
    VStack,
} from 'native-base';

import { S3Image } from 'aws-amplify-react-native';

const windowWidth = Dimensions.get('window').width;

class PostCard extends React.Component {

    getCurrentItem = () => this.props.post
  
    getUsername = () => this.getCurrentItem().username

    render() {
        return (
            <VStack>
                <Text style={{ fontWeight: 'bold', height: 50, lineHeight: 50, marginLeft: 10 }}>
                    { this.getUsername() }
                </Text>
                <S3Image imgKey={this.getCurrentItem().file.key} style={{ height:windowWidth, width:windowWidth }} />
        </VStack>
        )
    }
}

export default PostCard
