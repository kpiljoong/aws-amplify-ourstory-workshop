import React from 'react';

import { 
    View, Text,
    ScrollView, RefreshControl, ActivityIndicator,
    Alert,
    StyleSheet, Dimensions 
} from 'react-native';

import Auth from '@aws-amplify/auth';
import API, { graphqlOperation } from '@aws-amplify/api';
import Storage from '@aws-amplify/storage';

import Header from './Header';
import PostCard from './PostCard';

import * as Queries from './graphql/queries';
import * as Mutations from './graphql/mutations';

import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';

import AWSCONFIG from './aws-exports';

import { Buffer } from 'buffer';
import { v4 as uuid } from 'uuid';

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
            username: user.attributes.email.split('@')[0]
          })
        })
        .catch(err => console.log(err));

      await this.listPosts();
  }
    
  listPosts = async () => {
    try {
      const data = await API.graphql(graphqlOperation(Queries.listPosts))
      const posts = await data.data.listPosts.items;
      this.setState({ posts: posts });
    } catch (err) {
      console.log('error: ', err);
    }
  }
  
  onRefresh = () => {
    this.setState({ refreshing: true });
    this.listPosts().then(() => {
      this.setState({ refreshing: false })
    });
  }
  
  uploadPost = async() => {
    await Permissions.askAsync(Permissions.CAMERA_ROLL);
    const result = await ImagePicker.launchImageLibraryAsync(
        { base64: true, allowsEditing: false }
    );
    
    if (!result.cancelled) {
        this.setState({ refreshControl: true });
        await this.uploadPictureToS3(result).then(() => {
            Alert.alert(
                '성공',
                '사진이 성공적으로 업로드되었습니다.',
                [{ text: '확인', onPress: () => this.onRefresh() }],
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
  
  deletePost = (key) => {
    Alert.alert(
        '사진 삭제',
        '정말 삭제하시겠습니까?',
        [
          { text: '취소', onPress: () => { return }, style: 'cancel' },
          { text: '삭제', onPress: () => this.apiDeletePicture(key) }
        ],
        { cancelable: false }
      )
    
  }

  apiDeletePicture = async (key) => {
    this.setState({ refreshing: true });
    const postObj = await this.state.posts.filter(post => post.file.key === key);
    const postId = await postObj[0].id;
    try {
      await API.graphql(graphqlOperation(Mutations.deletePost, {input: {id: postId}}));
      await this.removeImageFromS3(key);
      await this.listPosts();
      Alert.alert(
        '삭제 성공',
        '포스트가 성공적으로 삭제되었습니다.',
        [
          { text: '확인', onPress: () => this.setState({ refreshing: false }) }
        ],
        { cancelable: false });
    } catch (err) {
      this.setState({ refreshing: false });
      console.log('error: ', err);
      Alert.alert(
        '삭제 실패',
        '포스트 삭제에 실패하였습니다.',
        [
          { text: '닫기' }
        ],
        { cancelable: false });
    }
  }
  
  removeImageFromS3 = async (key) => {
    await Storage.remove(key)
    .then(ret => console.log('Image deleted', ret))
    .catch(err => console.log('error: ', err));
  }
  
  // Likes
  onLikePressed = async (key) => {
    const postObj = await this.state.posts.filter(post => post.file.key === key);
    const userId = await this.state.userId;
    const likeUesrObj = await postObj[0].likes.items.filter(obj => obj.userId === userId)
    if (likeUesrObj.length !== 0) {
      await this.deleteLike(likeUesrObj);
    } else {
      await this.createLike(key)
    }
  }

  createLike = async (key) => {
    const postObj = await this.state.posts.filter(pic => pic.file.key === key);
    const postId = await postObj[0].id;
    const like = {
      likePostId: postId,
      userId: this.state.userId,
      username: this.state.username
    };
    try {
      await API.graphql(graphqlOperation(Mutations.createLike, { input: like }));
      this.listPosts();
    } catch (err) {
      console.log('error: ', err);
    }
  }

  deleteLike = async (likeUserObj) => {
    const likeObj = {
      id: likeUserObj[0]['id']
    };
    try {
      await API.graphql(graphqlOperation(Mutations.deleteLike, { input: likeObj }));
      this.listPosts();
    } catch (err) {
      console.log('error: ', err);
    }
  }
  
  render() {
    let userId = this.state.userId;
    let keys = this.state.posts.map(post => post.file.key)
    let { posts, refreshing, uploading } = this.state;
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Header uploadPost={this.uploadPost} />
        </View>
      
        <View>
          { uploading && <ActivityIndicator size="large" color="#0000ff" />}
        </View>
      
        <ScrollView
          style={{ marginBottom: 10}}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl
            refreshing={refreshing}
            onRefresh={this.onRefresh} />}>
          {
            keys.map((key, idx) => (
              <PostCard 
                key={idx}
                id={key}
                userId={userId}
                posts={posts}
                onDeletePressed={ this.deletePost }
                onLikePressed={() => this.onLikePressed(key)} />
            ))
          }
        </ScrollView>
      </View>)
    }
}

let width = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  activityIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 5
  }
});

export default Feed;