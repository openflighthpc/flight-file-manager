#!/bin/bash

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
VERSION_FILE="${REPO_ROOT}/package.json"
PACKAGE_NAME=$(cat "${REPO_ROOT}/package.json" | jq -r .name )

main() {
    parse_arguments "$@"
    validate_arguments
    header "Checking repo is clean"
    abort_if_uncommitted_changes_present
    abort_if_not_uptodate_with_remotes
    subheader "Creating release branch"
    checkout_release_branch
    if $BUMP_VERSION ; then
        header "Bumping version"
        bump_version
        commit_version_bump
    fi
    header "Building"
    build_and_test
    abort_if_uncommitted_changes_present
    header "Merging, tagging, and pushing"
    run_merge_script
}

abort_if_uncommitted_changes_present() {
    if ! git diff-index --quiet HEAD ; then
        echo "$0: Uncommitted changes present aborting. Either stash or commit."
        exit 2
    fi
}

abort_if_not_uptodate_with_remotes() {
    git fetch origin
    abort_if_not_uptodate_with_remote master
}

abort_if_not_uptodate_with_remote() {
    local branch local_rev remote_rev base_rev
    branch=${1:-HEAD}

    local_rev=$(git rev-parse ${branch})
    if [ "${branch}" == "HEAD" ] ; then
        remote_rev=$(git rev-parse @{upstream})
    else
        remote_rev=$(git rev-parse origin/${branch})
    fi
    if [ "${branch}" == "HEAD" ] ; then
        base_rev=$(git merge-base ${branch} @{upstream})
    else
        base_rev=$(git merge-base ${branch} origin/${branch})
    fi

    if [ $local_rev = $remote_rev ]; then
        # Everything is good.
        return 0
    elif [ $local_rev = $base_rev ]; then
        echo "Local branch (${branch}) not up-to-date.  You need to pull in the remote changes."
        exit 3
    elif [ $remote_rev = $base_rev ]; then
        echo "Local branch (${branch}) has unpushed changes.  Oops!"
        exit 4
    else
        echo "Local and remote branches have diverged.  Oh dear!!"
        exit 5
    fi
}

get_current_version() {
    cat package.json \
        | jq -r .version
}

get_new_version() {
    if [ -n "${NEW_VERSION}" ] ; then
        echo "${NEW_VERSION}"
    elif $BUMP_VERSION ; then
        get_current_version \
            | awk 'BEGIN { FS="." } { print $1 "." $2 "." $3 + 1 }'
    else
        get_current_version
    fi
}

checkout_release_branch() {
    local current
    current=$(git rev-parse --abbrev-ref HEAD)
    if [ "${current}" != release/"$(get_new_version)" ] ; then
        git checkout -b release/"$(get_new_version)"
    fi
}

bump_version() {
    yarn version --new-version $(get_new_version) --no-git-tag-version
}

commit_version_bump() {
    git commit -m "Bump version to $(get_current_version)" "${VERSION_FILE}"
}

build_and_test() {
    # We don't use this build, but its a good sanity check to have before
    # tagging a release.
    yarn run clean
    yarn run build
    #CI=true yarn run test
}

run_merge_script() {
    "${REPO_ROOT}"/bin/merge-and-tag-release.sh "$(get_current_version)"

}

header() {
    echo -e "=====> $@"
}

subheader() {
    echo -e "-----> $@"
}

indent() {
    sed 's/^/       /'
}

usage() {
    echo "Usage: $(basename $0) [options]"
    echo
    echo "Build, tag and release a new version of ${PACKAGE_NAME}"
    echo
    echo -e "      --version=VERSION\tBump to version number VERSION"
    echo -e "      --skip-version-bump\tDon't bump the version number"
    echo -e "      --help\t\t\tShow this help message"
}

BUMP_VERSION=true
NEW_VERSION=

parse_arguments() {
    while [[ $# > 0 ]] ; do
        key="$1"

        case $key in
            --help)
                usage
                exit 0
                ;;

            --skip-version-bump)
                BUMP_VERSION=false
                shift
                ;;

            --version)
                BUMP_VERSION=true
                NEW_VERSION="$2"
                shift
                shift
                ;;

            *)
                echo "$(basename $0): unrecognized option ${key}"
                usage
                exit 1
                ;;
        esac
    done
}

validate_arguments() {
    if [ "${BUMP_VERSION}" == "false" -a "${NEW_VERSION}" != "" ]; then
        echo "$(basename $0): cannot give both --version and --skip-version-bump"
        usage
        exit 1
    fi
}

main "$@"
