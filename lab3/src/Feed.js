import React from 'react';

import { 
    View, Text,
    ScrollView, RefreshControl, ActivityIndicator,
    StyleSheet, Dimensions 
} from 'react-native';

import Auth from '@aws-amplify/auth';
import API, { graphqlOperation } from '@aws-amplify/api';

import Header from './Header';
import PostCard from './PostCard';

import * as Queries from './graphql/queries';

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
  
  render() {
    let userId = this.state.userId;
    let keys = this.state.posts.map(post => post.file.key)
    let { posts, refreshing, uploading } = this.state;
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Header />
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
                posts={posts} />
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