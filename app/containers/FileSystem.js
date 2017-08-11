import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import FileSystem from '../components/FileSystem';
import * as ConfigActions from '../actions/config';

function mapStateToProps(state) {
  return {
    workspace: state.workspace,
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(ConfigActions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(FileSystem);
