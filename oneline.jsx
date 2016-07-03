import React from 'react'
import mlib from 'ssb-msgs'
import threadlib from 'patchwork-threads'
import { UserLinks, UserPics } from 'patchkit-links'
import NiceDate from 'patchkit-nicedate'
import { Inline as Content } from 'patchkit-msg-content'
import t from 'patchwork-translations'

export default class Oneline extends React.Component {
  static propTypes = {
    msg: React.PropTypes.object.isRequired,

    onSelect: React.PropTypes.func,
    selectiveUpdate: React.PropTypes.bool,
    forceRaw: React.PropTypes.bool
  }
  static contextTypes = {
    events: React.PropTypes.object.isRequired
  }

  constructor(props) {
    super(props)
    this.changeCounter = props.msg.changeCounter || 0
  }
  onClick() {
    if (this.props.onSelect)
      this.props.onSelect(this.props.msg)
    else
      this.context.events.emit('open:msg', this.props.msg.key)
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.selectiveUpdate) {
      var shouldUpdate = this.changeCounter !== nextProps.msg.changeCounter
      this.changeCounter = nextProps.msg.changeCounter
      return shouldUpdate
    }
    return true
  }

  render() {
    const msg = this.props.msg
    const lastMsg = (!this.props.forceRaw && msg.value) ? threadlib.getLastThreadPost(msg) : false
    let replies = threadlib.countReplies(msg)
    replies = (replies === 0) ? '' : `(${replies+1})`

    if (!msg.value) {
      return <div className={'msg-view oneline'+(msg.hasUnread ? ' unread' : '')+(!msg.plaintext ? ' private' : '')} onClick={this.onClick.bind(this)}>
        <div className="authors">
          <span className="replies">{replies}</span>
        </div>
        <div className="content">
          <span className="markdown markdown-inline">{t('msg.MissingMsg')}</span>
        </div>
      </div>
    }

    var labelIcons = []
    if (!msg.plaintext)   labelIcons.push(<i key="lock" className="fa fa-lock" />)
    // if (msg.mentionsUser) labelIcons.push(<i className="fa fa-at" />)
    // if (msg.isBookmarked) labelIcons.push(<i className="fa fa-bookmark" />)
    var label = labelIcons.length ? (<div className="label">{labelIcons}</div>) : ''
    var recps = [msg.value.author]
    if (Array.isArray(msg.value.content.recps))
      recps = recps.concat(msg.value.content.recps.map(link => mlib.link(link).link).filter(id => id != msg.value.author))
    recps = recps.slice(0,4)

    return <div className={'msg-view oneline'+(msg.hasUnread ? ' unread' : '')+(!msg.plaintext ? ' private' : '')} onClick={this.onClick.bind(this)}>
      <div className="authors">
        <UserPics ids={recps} hovertips />
        { recps.length == 1 ? <span>{' '}<UserLinks ids={recps} /></span> : '' }
        <span className="replies">{replies}</span>
      </div>
      <div className="content">
        <Content msg={msg} forceRaw={this.props.forceRaw} />
      </div>
      {''/*<div className="date"><NiceDate ts={(lastMsg||msg).value.timestamp} /></div>*/}
      { label }
    </div>
  }
}