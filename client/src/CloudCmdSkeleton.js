function CloudCmdSkeleton() {
  return (
    <div className="flight fm">
      <section data-name="js-left" className="panel panel-left panel-single">
        <div data-name="js-path" className="reduce-text" title="/" style={{ visibility: 'hidden' }}>
          <span data-name="js-copy-path" className="path-icon ppppp icon-copy-to-clipboard" title="copy path (Ctrl+P)">
          </span>
          <a data-name="js-refresh" href="/" className="path-icon testclass icon-refresh" title="refresh (Ctrl+R)"></a>
          <span data-name="js-links" className="links">
          </span>
        </div>
        <div data-name="js-fm-header" className="fm-header">
        </div>
        <ul data-name="js-files" className="files">
        </ul>
      </section>
    </div>
  );
}

export default CloudCmdSkeleton;
