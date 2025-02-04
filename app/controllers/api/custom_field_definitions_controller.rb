# frozen_string_literal: true

# License: AGPL-3.0-or-later WITH WTO-AP-3.0-or-later
# Full license explanation at https://github.com/houdiniproject/houdini/blob/main/LICENSE

# A controller for interacting with a nonprofit's custom field definition
class Api::CustomFieldDefinitionsController < Api::ApiController
	include Controllers::Nonprofit::Current
	include Controllers::Nonprofit::Authorization
	before_action :authenticate_nonprofit_user!

	# Gets the nonprofits custom field definitions
	# If not logged in, causes a 401 error
	def index
		@custom_field_definitions = current_nonprofit.custom_field_definitions
	end

	# Gets a single custom field definition
	# If not logged in, causes a 401 error
	def show
		@custom_field_definition = current_nonprofit.custom_field_definitions.find(params[:id])
	end
end
