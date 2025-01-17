import * as React from 'react';
import * as classNames from 'classnames';
import { referenceFor, modelFor } from '@console/internal/module/k8s';
import { useAccessReview } from '@console/internal/components/utils';
import { Layer, Edge, WithRemoveConnectorProps, observer, useHover } from '@console/topology';
import { getTopologyResourceObject } from '../../../topology/topology-utils';
import './BaseEdge.scss';

type BaseEdgeProps = {
  element: Edge;
  dragging?: boolean;
  className?: string;
} & WithRemoveConnectorProps;

const BaseEdge: React.FC<BaseEdgeProps> = ({
  element,
  dragging,
  onShowRemoveConnector,
  onHideRemoveConnector,
  children,
  className,
}) => {
  const [hover, hoverRef] = useHover();
  const startPoint = element.getStartPoint();
  const endPoint = element.getEndPoint();
  const resourceObj = getTopologyResourceObject(element.getSource().getData());
  const resourceModel = modelFor(referenceFor(resourceObj));

  const editAccess = useAccessReview({
    group: resourceModel && resourceModel.apiGroup,
    verb: 'patch',
    resource: resourceModel && resourceModel.plural,
    name: resourceObj.metadata.name,
    namespace: resourceObj.metadata.namespace,
  });

  React.useLayoutEffect(() => {
    if (editAccess) {
      if (hover && !dragging) {
        onShowRemoveConnector && onShowRemoveConnector();
      } else {
        onHideRemoveConnector && onHideRemoveConnector();
      }
    }
  }, [hover, dragging, onShowRemoveConnector, onHideRemoveConnector, editAccess]);

  return (
    <Layer id={dragging || hover ? 'top' : undefined}>
      <g
        ref={hoverRef}
        data-test-id="edge-handler"
        className={classNames(className, 'odc2-base-edge', {
          'is-highlight': dragging,
          'is-hover': hover,
        })}
      >
        <line
          x1={startPoint.x}
          y1={startPoint.y}
          x2={endPoint.x}
          y2={endPoint.y}
          strokeWidth={10}
          stroke="transparent"
        />
        <line
          className="odc2-base-edge__link"
          x1={startPoint.x}
          y1={startPoint.y}
          x2={endPoint.x}
          y2={endPoint.y}
        />
        {children}
      </g>
    </Layer>
  );
};

export default observer(BaseEdge);
