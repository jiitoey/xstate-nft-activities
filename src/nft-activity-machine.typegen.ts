// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  eventsCausingActions: {
    updateActivity: "done.invoke.fetch-activity";
    updateSelectedActivities: "ACTIVITY.TOGGLE";
    updateSortBy: "ACTIVITY.SORT_CHANGED";
  };
  internalEvents: {
    "done.invoke.fetch-activity": {
      type: "done.invoke.fetch-activity";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "xstate.init": { type: "xstate.init" };
    "error.platform.fetch-activity": {
      type: "error.platform.fetch-activity";
      data: unknown;
    };
  };
  invokeSrcNameMap: {
    fetchActivity: "done.invoke.fetch-activity";
  };
  missingImplementations: {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingServices: {
    fetchActivity:
      | "ACTIVITY.RELOAD"
      | "ACTIVITY.TOGGLE"
      | "ACTIVITY.SORT_CHANGED";
  };
  eventsCausingGuards: {};
  eventsCausingDelays: {};
  matchesStates: "loading" | "display" | "failed";
  tags: never;
}
