# frozen_string_literal: true

# License: AGPL-3.0-or-later WITH WTO-AP-3.0-or-later
# Full license explanation at https://github.com/houdiniproject/houdini/blob/main/LICENSE
require 'rails_helper'

RSpec.describe CampaignGiftPurchase, type: :model do
  include_context :shared_donation_charge_context
  # TODO Why are we manually setting everything here? It's not clear what order things should
  # go in for a transaction. Therefore, we don't assume the order for now and just make sure the
  # the output of to_builder is right
  let(:trx) { force_create(:transaction, supporter: supporter, amount: 400)}

  let(:campaign_gift_purchase) {trx.campaign_gift_purchases.create(campaign: campaign, amount: 400, campaign_gifts: [ModernCampaignGift.new(amount: 400, legacy_campaign_gift:lcg)])}
  let(:lcg) { CampaignGift.create(
    donation: supporter.donations.create(amount: 400, campaign: campaign, nonprofit: nonprofit, supporter:supporter),
    campaign_gift_option: campaign_gift_option
  )}
  let(:campaign_gift_option) { create(:campaign_gift_option, amount_one_time: 400, campaign: campaign)}
  let(:campaign_gift) { campaign_gift_purchase.campaign_gifts.first}

  let(:campaign_builder_expanded) do 
    {
      'id' => kind_of(Numeric),
      'name' => campaign.name,
      'object' =>  "campaign",
      'nonprofit' =>  nonprofit.id
    }
  end

  let(:cgo_builder_expanded) do 
    {
      'id' => kind_of(Numeric),
      'name' => campaign_gift_option.name,
      'description' => campaign_gift_option.description,
      'hide_contributions' => campaign_gift_option.hide_contributions,
      'order' => campaign_gift_option.order,
      'to_ship' => campaign_gift_option.to_ship,
      'object' => 'campaign_gift_option',
      'deleted' => false,
      'gift_option_amount' => [{
        'amount' => {
          'cents' => 400,
          'currency' => 'usd'
        },
      }],
      'campaign' => kind_of(Numeric),
      'nonprofit' => nonprofit.id
    }
  end

  let(:np_builder_expanded) do 
    {
      'id' => nonprofit.id,
      'name' => nonprofit.name,
      'object' => 'nonprofit'
    }
  end

  let(:supporter_builder_expanded) do 
    supporter_to_builder_base.merge({'name'=> 'Fake Supporter Name'})
  end

  let(:transaction_builder_expanded) do 
    { 
      'id' => match_houid('trx'),
      'object' => 'transaction',
      'amount' => {
        'cents' => trx.amount,
        'currency' => 'usd'
      },
      'created' => Time.current.to_i,
      'supporter' => supporter.id,
      'nonprofit' => nonprofit.id,
      'subtransaction' => nil,
      'subtransaction_payments' => [],
      'transaction_assignments' => [
        cgp_builder_to_id
      ]
    }
  end

  let(:cgp_builder_to_id) do 
    {
      'id' => match_houid('cgpur'),
      'object' => 'campaign_gift_purchase',
      'type' => 'trx_assignment'
    }
  end
  
  let(:cgp_builder_expanded) do
    { 
      'id' => match_houid('cgpur'),
      'campaign' => kind_of(Numeric),
      'object' => 'campaign_gift_purchase',
      'campaign_gifts' => [modern_campaign_gift_builder],
      'amount' => {
        'cents' => trx.amount,
        'currency' => 'usd'
      },
      'supporter' => supporter_builder_expanded,
      'nonprofit' => np_builder_expanded,
      'transaction' => transaction_builder_expanded,
      'deleted' => false
    }
  end
  
  let(:modern_campaign_gift_builder) {
    {
      'amount' => {
        'cents' => 400,
        'currency' => 'usd'
      },
      'campaign' => kind_of(Numeric),
      'campaign_gift_option' => kind_of(Numeric),
      'campaign_gift_purchase' => match_houid('cgpur'),
      'deleted' => false,
      'id' => match_houid('cgift'),
      'nonprofit'=> nonprofit.id,
      'object' => 'campaign_gift',
      'supporter' => supporter.id,
      'transaction' => match_houid('trx')
    }
  }
  

  

  it 'announces created properly when called' do
    allow(Houdini.event_publisher).to receive(:announce)
    expect(Houdini.event_publisher).to receive(:announce).with(:campaign_gift_option_created, any_args)
    expect(Houdini.event_publisher).to receive(:announce).with(:campaign_gift_purchase_created, {
      'id' => match_houid('objevt'),
      'object' => 'object_event',
      'type' => 'campaign_gift_purchase.created',
      'data' => {
        'object' => {
          'id' => match_houid('cgpur'),
          'campaign' => campaign_builder_expanded,
          'object' => 'campaign_gift_purchase',
          'campaign_gifts' => [modern_campaign_gift_builder],
          'amount' => {
            'cents' => trx.amount,
            'currency' => 'usd'
          },
          'supporter' => supporter_builder_expanded,
          'nonprofit' => np_builder_expanded,
          'transaction' => transaction_builder_expanded,
          'deleted' => false,
          'type' => 'trx_assignment'
        }
      }
    })

    campaign_gift_purchase.publish_created
  end

  it 'announces updated properly when called' do
    allow(Houdini.event_publisher).to receive(:announce)
    expect(Houdini.event_publisher).to receive(:announce).with(:campaign_gift_option_created, any_args)
    expect(Houdini.event_publisher).to receive(:announce).with(:campaign_gift_purchase_updated, {
      'id' => match_houid('objevt'),
      'object' => 'object_event',
      'type' => 'campaign_gift_purchase.updated',
      'data' => {
        'object' => {
          'id' => match_houid('cgpur'),
          'campaign' => campaign_builder_expanded,
          'object' => 'campaign_gift_purchase',
          'campaign_gifts' => [modern_campaign_gift_builder],
          'amount' => {
            'cents' => trx.amount,
            'currency' => 'usd'
          },
          'supporter' => supporter_builder_expanded,
          'nonprofit' => np_builder_expanded,
          'transaction' => transaction_builder_expanded,
          'deleted' => false,
          'type' => 'trx_assignment'
        }
      }
    })

    campaign_gift_purchase.publish_updated
  end

  it 'announces updated deleted properly when called' do
    allow(Houdini.event_publisher).to receive(:announce)
    expect(Houdini.event_publisher).to receive(:announce).with(:campaign_gift_option_created, any_args)
    expect(Houdini.event_publisher).to receive(:announce).with(:campaign_gift_purchase_deleted, {
      'id' => match_houid('objevt'),
      'object' => 'object_event',
      'type' => 'campaign_gift_purchase.deleted',
      'data' => {
        'object' => {
          'id' => match_houid('cgpur'),
          'campaign' => campaign_builder_expanded,
          'object' => 'campaign_gift_purchase',
          'campaign_gifts' => [modern_campaign_gift_builder],
          'amount' => {
            'cents' => trx.amount,
            'currency' => 'usd'
          },
          'supporter' => supporter_builder_expanded,
          'nonprofit' => np_builder_expanded,
          'transaction' => transaction_builder_expanded,
          'deleted' => true,
          'type' => 'trx_assignment'
        }
      }
    })

    campaign_gift_purchase.discard!
    campaign_gift_purchase.publish_deleted
  end
end