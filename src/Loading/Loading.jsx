import React from 'react';
import SVGInline from 'react-svg-inline';
import cx from 'classnames';

import './Loading.scss';

const hassLogo = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path class="house" d="M1.9 8.5V5.3h-1l4-4.3 2.2 2.1v-.6h1v1.7l1 1.1H7.9v3.2z" /><path class="circut" d="M5 8.5V4m0 3.5l1.6-1.6V4.3M5 6.3L3.5 4.9v-.6m2.7.7l.4.4L7 5M5.9 6.1v.5h.5M4.2 5v.5h-.8m1 1.5v.6h-.6m1.2.8L3.6 6.7M5 8.4l1-.9h.7M4.6 3.6L5 4l.4-.4" /><g><circle cx="5.5" cy="3.4" r="0.21" /><circle cx="4.5" cy="3.4" r="0.21" /><circle cx="6.6" cy="4.1" r="0.21" /><circle cx="3.5" cy="4.1" r="0.21" /><circle cx="4.2" cy="4.8" r="0.21" /><circle cx="6.1" cy="4.8" r="0.21" /><circle cx="7.1" cy="4.8" r="0.21" /><circle cx="6.6" cy="6.6" r="0.21" /><circle cx="5.9" cy="5.9" r="0.21" /><circle cx="3.2" cy="5.5" r="0.21" /><circle cx="3.5" cy="6.5" r="0.21" /><circle cx="4.4" cy="6.8" r="0.21" /><circle cx="3.6" cy="7.6" r="0.21" /><circle cx="6.9" cy="7.5" r="0.21" /></g></svg>';

export default class Loading extends React.Component {
  render() {
    const { className } = this.props;

    return (
      <div className={cx({ initializing: true, [className]: true })}>
        <SVGInline svg={hassLogo} />
      </div>
    );
  }
}
