import { connect } from 'react-redux';
import App from '../components/App';
import { base } from '../actions';

const mapStateToProps = state => {
  return state;
};

const mapDispatchToProps = dispatch => ({
  onInit: () => {
    dispatch(base);
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
