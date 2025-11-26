import React from 'react';
import PostloginAdmin from './PostloginAdmin';

const PostloginAnalyst = ({ user }) => {
  return <PostloginAdmin user={user} mode="analyst" />;
};

export default PostloginAnalyst;
