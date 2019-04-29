import React from 'react';

import { View, ScrollView, RefreshControl, Alert,
  ActionSheetIOS, Platform,
  StyleSheet, Dimensions } from 'react-native';
  
import Auth from '@aws-amplify/auth';
import API, { graphqlOperation } from '@aws-amplify/api';
import Storage from '@aws-amplify/storage';

import AWSCONFIG from './aws-exports';

import Header from './Header';
import PostCard from './PostCard';

import * as Queries from './graphql/queries';
import * as Mutations from './graphql/mutations';

import { ImagePicker, Permissions } from 'expo';

import { Buffer } from 'buffer';
import { v4 as uuid } from 'uuid';

class Feed extends React.Component {
    
  state = {
    userId: '',
    username: '',
    posts: [],
    optionsVisible: false
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
    this.listPosts().then(() => this.setState({ refreshing: false }));
  }

  uploadPost = async () => {
    await Permissions.askAsync(Permissions.CAMERA_ROLL);
    const result = await ImagePicker.launchImageLibraryAsync(
      { base64: true, allowsEditing: false }
    );
      
    if (!result.cancelled) {
      this.setState({ refreshing: true});
      await this.uploadPictureToS3(result).then(() => {
        Alert.alert(
          '성공',
          '사진이 성공적으로 업로드되었습니다.',
          [{ text: '확인', onPress: () => this.onRefresh() }],
          { cancelable: false }
          );
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

  isOwnPost = (key) => {
    return this.state.posts.filter(pic => pic.file.key === key)[0].userId === this.state.userId;
  }

  onOptionsPressed = (key) => {
    if (Platform.OS == 'ios') {
      ActionSheetIOS.showActionSheetWithOptions({
          options: ['닫기', '삭제'],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 0
        },
        (btnIdx) => {
          if (btnIdx === 1 && this.isOwnPost(key)) {
            this.deletePost(key);
          } else if (btnIdx === 1) {
            Alert.alert('권한이 없습니다.');
          }
        }
      )
    } else {
      this.showOptions();
    }
  }
    
  showOptions = () => {
    this.setState({ optionsVisible: true });
  }
  
  hideOptions = () => {
    this.setState({ optionsVisible: false });
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
  
  render() {
    let userId = this.state.userId;
    let keys = this.state.posts.map(post => post.file.key)
    let { posts, refreshing } = this.state;
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Header uploadPost={this.uploadPost} />
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
                onOptionsPressed={() => this.onOptionsPressed(key)} />
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