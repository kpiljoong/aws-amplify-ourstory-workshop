import React from 'react';

import { 
    View,
    Text,
	ScrollView,
	VStack,
} from 'native-base';

import { 
	RefreshControl,
	Alert,
} from 'react-native';

import { Auth } from 'aws-amplify'
import API, { graphqlOperation } from '@aws-amplify/api';

import * as Queries from './graphql/queries';
import * as Mutations from './graphql/mutations';

import Storage from '@aws-amplify/storage';

import AWSCONFIG from './aws-exports';

import { Buffer } from 'buffer';
import { v4 as uuid } from 'uuid';

import PostCard from './PostCard';
import Header from './Header';

import * as Camera from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

class Feed extends React.Component {
    
    state = {
        userId: '',
        username: '',
        posts: []
    }
    
    componentDidMount = async () => {
        await Auth.currentAuthenticatedUser()
            .then(user => {
                this.setState({
                    userId: user.attributes.sub,
                    username: user.username
                })
            })
            .catch(err => console.log(err));
        
        await this.listPosts();
    }

    listPosts = async () => {
        try {
            const data = await API.graphql(graphqlOperation(Queries.byCreatedAt, {
                type: 'Post',
                sortDirection: 'DESC'
            }));
            const posts = await data.data.byCreatedAt.items;
            this.setState({ posts: posts });
        } catch (err) {
            console.log('listPosts err: ', err);
        }
    }
    
    onRefresh = () => {
        this.setState({ refreshing: true });
        this.listPosts().then(() => {
            this.setState({ refreshing: false })
        });
    }
    
    uploadPost = async() => {
        await Camera.requestCameraPermissionsAsync()
        const result = await ImagePicker.launchImageLibraryAsync(
            { base64: true, allowsEditing: false }
        );
        // upload selected photo
        if (!result.cancelled) {
            this.setState({ refreshing: true });
            await this.uploadPictureToS3(result).then(() => {
                Alert.alert(
                    'Success',
                    'Photo is successfully uploaded',
                    [{ text: 'Close', onPress: () => this.onRefresh() }],
                    { cancelable: false });
            });
        }
    }
    
    uploadPictureToS3 = async (localImage) => {
        const key = uuid() + '.jpg';
        const buffer = new Buffer(localImage.base64, 'base64');
        Storage.put(key, buffer, {
            contentType: 'image/jpg'
        }).then((res) => {
            const bucket = AWSCONFIG.aws_user_files_s3_bucket;
            const region = AWSCONFIG.aws_user_files_s3_bucket_region;
            const file = { bucket, region, key };
            API.graphql(graphqlOperation(Mutations.createPost, { input: {
                id: uuid(),
                userId: this.state.userId,
                username: this.state.username,
                file: file
            }}));
        }).catch(e => {
            console.log(e);
        });
    }

	render() {
        let { refreshing } = this.state;
    
    	return (
            <VStack>
                <Header uploadPost={this.uploadPost} />
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this.onRefresh} />}>
                {
                    this.state.posts.map((p, i) => (
                        <PostCard
                            key={p.id}
                            id={p.id}
                            userId={this.state.userId}
                            post={p} />
                    ))
                }
                </ScrollView>
            </VStack>
        );
    }
}

export default Feed;
