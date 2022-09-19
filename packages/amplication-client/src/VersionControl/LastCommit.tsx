import React, { useMemo, useContext, useEffect } from "react";
import { NetworkStatus, useQuery } from "@apollo/client";
import classNames from "classnames";
import { isEmpty } from "lodash";
import * as models from "../models";
import { Tooltip, Button, EnumButtonStyle } from "@amplication/design-system";
import { ClickableId } from "../Components/ClickableId";
import "./LastCommit.scss";
import { AppContext } from "../context/appContext";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { BuildStatusIcon } from "./BuildStatusIcon";
import { GET_LAST_COMMIT } from "./hooks/commitQueries";

type TData = {
  commits: models.Commit[];
};

type Props = {
  projectId: string;
};

const CLASS_NAME = "last-commit";

const LastCommit = ({ projectId }: Props) => {
  const {
    currentWorkspace,
    currentProject,
    commitRunning,
    pendingChangesIsError,
  } = useContext(AppContext);

  const {
    data,
    loading,
    refetch,
    startPolling,
    stopPolling,
    networkStatus,
  } = useQuery<TData>(GET_LAST_COMMIT, {
    variables: {
      projectId,
    },
    skip: !projectId,
  });

  useEffect(() => {
    if (networkStatus === NetworkStatus.refetch) {
      startPolling(1000);
    }
    if (
      data?.commits?.[0]?.builds?.[0]?.status ===
      models.EnumBuildStatus.Completed
    ) {
      stopPolling();
    }
  }, [networkStatus, data]);

  useEffect(() => {
    refetch();
    return () => {
      refetch();
    };
  }, [pendingChangesIsError, refetch, data]);

  const lastCommit = useMemo(() => {
    if (loading || isEmpty(data?.commits)) return null;
    const [last] = data?.commits || [];
    return last;
  }, [loading, data]);

  const build = useMemo(() => {
    if (!lastCommit) return null;
    const [last] = lastCommit.builds || [];
    return last;
  }, [lastCommit]);

  if (!lastCommit) return null;

  const ClickableCommitId = (
    <ClickableId
      to={`/${currentWorkspace?.id}/${currentProject?.id}/commits/${lastCommit.id}`}
      id={lastCommit.id}
      label="Commit"
      eventData={{
        eventName: "lastCommitIdClick",
      }}
    />
  );

  const generating = commitRunning;

  return (
    <div
      className={classNames(`${CLASS_NAME}`, {
        [`${CLASS_NAME}__generating`]: generating,
      })}
    >
      <hr className={`${CLASS_NAME}__divider`} />
      <div className={`${CLASS_NAME}__content`}>
        <p className={`${CLASS_NAME}__title`}>
          Last Commit
          {build && <BuildStatusIcon buildStatus={build.status} />}
        </p>

        <div className={`${CLASS_NAME}__status`}>
          <div>
            {isEmpty(lastCommit?.message) ? (
              ClickableCommitId
            ) : (
              <Tooltip aria-label={lastCommit?.message} direction="ne">
                {ClickableCommitId}
              </Tooltip>
            )}
          </div>
          <span className={classNames("clickable-id")}>
            {formatTimeToNow(lastCommit?.createdAt)}
          </span>
        </div>
        {build && (
          <Link
            to={`/${currentWorkspace?.id}/${currentProject?.id}/code-view`}
            className={`${CLASS_NAME}__view-code`}
          >
            <Button
              buttonStyle={EnumButtonStyle.Secondary}
              disabled={generating}
              eventData={{
                eventName: "LastCommitViewCode",
              }}
            >
              Go to view code
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

function formatTimeToNow(time: Date | null): string | null {
  return (
    time &&
    formatDistanceToNow(new Date(time), {
      addSuffix: true,
    })
  );
}

export default LastCommit;
