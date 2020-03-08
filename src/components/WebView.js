import React, { useRef, useCallback } from "react"
import { Linking } from 'react-native'
import { WebView as RDWebView } from 'react-native-webview'

const WebView = ({
  forwardRef,  // I do this so I can be consistent with WebView.web.js
  ...props
}) => {

  const webviewRef = useRef()

  const onNavigationStateChange = useCallback(
    ({ url }) => {
      if(/^https?:\/\//.test(url)) {
        webviewRef.current.stopLoading()
        Linking.openURL(url)
      }
    },
    [],
  )

  const setRef = useCallback(
    ref => {
      webviewRef.current = ref
      if(forwardRef) {
        forwardRef.current = ref
      }
    },
    [],
  )

  return (
    <RDWebView
      ref={setRef}
      onNavigationStateChange={onNavigationStateChange}
      {...props}
    />
  )

}

export default WebView
