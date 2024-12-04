# Container Prompts
This Firefox addon will prompt you to select a Multi-account Container whenever you open a new tab.

<img width="1512" alt="Screenshot 2024-12-04 at 10 52 53 pm" src="https://github.com/user-attachments/assets/201c9953-2650-4f3b-a548-4223a0253fc4">

<img width="1512" alt="Screenshot 2024-12-04 at 10 56 12 pm" src="https://github.com/user-attachments/assets/ffd26647-4acd-4302-8d1d-e19367d7c06b">


## Developing
This is a very simple addon so there's no build process or anything.
1. Clone this repository.
2. Open Firefox and navigate to `about:debugging`.
3. Click on "This Firefox" in the sidebar.
4. Click on "Load Temporary Add-on" and select the `manifest.json` file from this repository.

## Usage
Once installed, open a new tab and you will be prompted to select a Multi-account Container (but only if you're not already in a container).

## Notes
* You will need to enable [Multi-Account Containers](https://addons.mozilla.org/firefox/addon/multi-account-containers/) to use this add-on.
* I was experimenting with Github Copilot while building this so there's some terrible code in here that I haven't got time to fix.

## Thanks
* Thank you to KazuAlex for making the [New Tab Page Container](https://addons.mozilla.org/firefox/addon/new-tab-page-container/) which inspired this.
