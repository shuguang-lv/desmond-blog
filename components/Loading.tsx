import * as React from 'react'

import { LoadingIcon } from './LoadingIcon'
import styles from '@/css/loading.module.css'

export const Loading: React.FC = () => (
  <div className={styles.container}>
    <LoadingIcon />
  </div>
)
