import React from 'react';

import { 
    View,
    Text,
	ScrollView,
} from 'native-base';

import { Auth } from 'aws-amplify'
import API, { graphqlOperation } from '@aws-amplify/api';

import * as Queries from './graphql/queries';

import PostCard from './PostCard';

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
            const data = await API.graphql(graphqlOperation(Queries.listPosts));
            const posts = await data.data.listPosts.items;
            this.setState({ posts: posts });
        } catch (err) {
            console.log('listPosts err: ', err);
        }
    }

	render() {
        return (
            <ScrollView>
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
        );
    }
}

export default Feed;
