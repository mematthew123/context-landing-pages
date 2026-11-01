import {useEffect, useState} from 'react'
import {RocketIcon} from '@sanity/icons/Rocket'
import {type DocumentActionComponent, useDocumentOperation} from 'sanity'

// Requests a Build: stamps buildRequestedAt and publishes, because the build-page Function only
// sees published Briefs.
export const BuildPageAction: DocumentActionComponent = (props) => {
  const {patch, publish} = useDocumentOperation(props.id, props.type)
  const [requesting, setRequesting] = useState(false)
  const status = (props.draft ?? props.published)?.status

  useEffect(() => {
    if (requesting && !props.draft) setRequesting(false)
  }, [requesting, props.draft])

  const building = status === 'building'
  const blocked = publish.disabled && publish.disabled !== 'ALREADY_PUBLISHED' && publish.disabled !== 'NO_CHANGES'

  return {
    label: requesting ? 'Requesting…' : building ? 'Building…' : 'Build page',
    icon: RocketIcon,
    tone: 'primary',
    disabled: requesting || building || Boolean(blocked),
    title: blocked ? `Can't publish: ${publish.disabled}` : undefined,
    onHandle: () => {
      setRequesting(true)
      patch.execute([{set: {buildRequestedAt: new Date().toISOString()}}])
      publish.execute()
      props.onComplete()
    },
  }
}
