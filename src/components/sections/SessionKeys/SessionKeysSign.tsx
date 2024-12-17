import { Button } from "@/components/ui/Button"
import { toHexChainid } from "@/helpers/chainId"
import {
  allowedMethods,
  expiry,
  metaData,
  sessionKey,
} from "@/helpers/sessionKeys"
import {
  buildSessionAccount,
  createSession,
  CreateSessionParams,
  createSessionRequest,
  Session,
} from "@argent/x-sessions"
import { useAccount, useSignTypedData } from "@starknet-react/core"
import { useState } from "react"
import { Account, AccountInterface, constants } from "starknet"
import { SectionLayout } from "../SectionLayout"
import { ARGENT_SESSION_SERVICE_BASE_URL, provider } from "@/constants"
import { SessionKeysExecute } from "./Execute/SessionKeysExecute"
import { SessionKeysExecuteOutside } from "./ExecuteFromOutside/SessionKeysExecuteOutside"
import { SessionKeysTypedDataOutside } from "./TypedDataExecuteFromOutside/SessionKeysTypedDataOutside"

const SessionKeysSign = () => {
  const { address, chainId } = useAccount()
  const [session, setSession] = useState<Session>()
  const [sessionAccount, setSessionAccount] = useState<
    Account | AccountInterface | undefined
  >()

  const sessionParams: CreateSessionParams = {
    allowedMethods,
    expiry,
    metaData: metaData(false),
    sessionKey,
  }

  const hexChainId = toHexChainid(chainId)

  const sessionRequest = createSessionRequest({
    sessionParams,
    chainId: hexChainId as constants.StarknetChainId,
  })

  const { signTypedDataAsync } = useSignTypedData({
    params: sessionRequest.sessionTypedData,
  })

  const handleSignSessionKeys = async () => {
    if (!address || !chainId) {
      throw new Error("No address or chainId")
    }

    const authorisationSignature = await signTypedDataAsync()
    const sessionObj = await createSession({
      address: address,
      chainId: hexChainId as constants.StarknetChainId,
      authorisationSignature,
      sessionRequest,
    })

    const sessionAccount = await buildSessionAccount({
      session: sessionObj,
      sessionKey,
      provider,
      argentSessionServiceBaseUrl: ARGENT_SESSION_SERVICE_BASE_URL,
    })

    setSession(sessionObj)
    setSessionAccount(sessionAccount)
  }

  return (
    <SectionLayout sectionTitle="Session Keys">
      <div className="flex w-1/2 justify-start">
        <Button onClick={handleSignSessionKeys} hideChevron>
          Create session
        </Button>
      </div>
      <SessionKeysExecute sessionAccount={sessionAccount} />
      <SessionKeysExecuteOutside
        session={session}
        sessionAccount={sessionAccount}
      />
      <SessionKeysTypedDataOutside
        session={session}
        sessionAccount={sessionAccount}
      />
    </SectionLayout>
  )
}

export { SessionKeysSign }
