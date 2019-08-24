import style from './show.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import {Link} from 'react-router-dom';
import showdown from 'showdown';
import API from '../api/index.js';
import Config from '../components/config.js';
import LoadingView from '../loading/loading.js';

class Show extends Component {
  constructor(props) {
    super(props);
    this.api = new API();
    this.converter = new showdown.Converter();

    let id = this.props.match.params.id;
    this.state = {
      group_id: id,
      name: '',
      description: '',
      users_count: 0,
      is_member: false,
      created_at: '',
      user: {},
      is_owner: false,
      loading: true,
      handling: false
    }

    this.handleJoin = this.handleJoin.bind(this);
    this.handleExit = this.handleExit.bind(this);
  }

  componentDidMount() {
    let user = this.api.user.local();
    this.api.group.show(this.state.group_id).then((data) => {
      if (user && user.user_id == data.user.user_id) {
        data.is_owner = true;
      }
      data.loading = false;
      data.html_description = this.converter.makeHtml(data.description);
      this.setState(data);
    });
  }

  handleJoin(e, value) {
    e.preventDefault();
    if (this.state.handling) {
      return
    }
    this.api.group.join(this.state.group_id).then(() => {
      this.setState({is_member: true, handling: false});
    });
  }

  handleExit(e, value) {
    e.preventDefault();
    if (this.state.handling) {
      return
    }
    this.api.group.exit(this.state.group_id).then(() => {
      this.setState({is_member: false, handling: false});
    });
  }

  render() {
    let state = this.state;

    let seoView = (
      <Helmet>
        <title>{state.name} - {state.user.nickname} - {Config.Name}</title>
        <meta name='description' content={state.description.slice(0, 256)} />
      </Helmet>
    )

    let loadingView = (
      <div className={style.loading}>
        <LoadingView style='md-ring'/>
      </div>
    )

    let editAction;
    if (state.is_owner) {
      editAction = (
        <Link to={`/groups/${state.group_id}/edit`} className={style.edit}>
          <FontAwesomeIcon icon={['far', 'edit']} />
        </Link>
      )
    }

    let actionView = '';
    if (!state.is_owner) {
      actionView = state.is_member ? <Link onClick={(e) => this.handleExit(e)}>{i18n.t('group.exit')}</Link>
        : <Link onClick={(e) => this.handleJoin(e)}>{i18n.t('group.join')}</Link>
    }

    let showView = (
      <div className={style.group}>
        <div className={style.head}>
          <div className={style.title}>
            <h1 className={style.name}>
              {state.name}
              {editAction}
            </h1>
            <div className={style.nickname}>
              By {state.user.nickname}
            </div>
          </div>
          <img src={state.user.avatar_url} className={style.avatar} />
        </div>
        <div>
          <article className={`md ${style.body}`} dangerouslySetInnerHTML={{__html: state.html_description}} />
        </div>
        <div className={style.action}>
          {actionView}
        </div>
      </div>
    )

    let sideView = (
      <div>
        <div className={style.navi}>
          <Link to={`/groups/${state.group_id}/members`}>
            {i18n.t('group.navi.members', {count: state.users_count})}
          </Link>
        </div>
        <div className={style.navi}>
          <Link to={`/groups/${state.group_id}/messages`}>
            {i18n.t('group.navi.messages')}
          </Link>
        </div>
      </div>
    )

    return (
      <div className='container'>
        {!state.loading && seoView}
        <main className='column main'>
          {state.loading && loadingView}
          {!state.loading && showView}
        </main>
        <aside className='column aside'>
          {this.api.user.loggedIn() && sideView}
        </aside>
      </div>
    )
  }
}

export default Show;
